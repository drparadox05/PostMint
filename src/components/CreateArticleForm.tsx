import React, { useRef, useState, useMemo } from 'react';
import { Upload, Image, Type, Lock, Coins, FileText, Zap } from 'lucide-react';
import { setApiKey, createCoin, createCoinCall, createMetadataBuilder, createZoraUploaderForCreator, DeployCurrency, InitialPurchaseCurrency, ValidMetadataURI } from "@zoralabs/coins-sdk";
import { createWalletClient, createPublicClient, http, Address, parseEther } from "viem";
import { base } from "viem/chains";
import { useAccount, useWalletClient, useSimulateContract, useWriteContract } from 'wagmi';

setApiKey(import.meta.env.VITE_ZORA_API_KEY);

const publicClient = createPublicClient({
  chain: base,
  transport: http(import.meta.env.VITE_RPC_URL as string),
});

const base64ToBlob = (base64: string, contentType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

const generateArticleHTML = (data: {
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  mintPrice?: string;
}) => {
  // Convert content to paragraphs for compactness
  const paragraphs = data.content
    .split(/\n+/)
    .filter(Boolean)
    .map(p => `<p>${p.trim()}</p>`) // wrap each non-empty line in <p>
    .join('\n');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${data.title}</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        max-width: 800px; 
        margin: 0 auto; 
        padding: 20px;
        line-height: 1.6;
        color: #333;
      }
      h1 { 
        color: #2c3e50; 
        border-bottom: 3px solid #3498db;
        padding-bottom: 10px;
      }
      .excerpt { 
        font-size: 1.2em; 
        color: #7f8c8d; 
        margin-bottom: 30px;
        font-style: italic;
        border-left: 4px solid #3498db;
        padding-left: 20px;
      }
      .featured-image { 
        width: 600px;
        height: 300px;
        object-fit: cover;
        display: block;
        margin: 20px auto; 
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .content { 
        line-height: 1.8;
        font-size: 1.1em;
      }
      .content p {
        margin-bottom: 1.5em;
      }
      .metadata-info {
        margin-top: 40px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #28a745;
      }
      .metadata-info h3 {
        color: #28a745;
        margin-top: 0;
      }
    </style>
  </head>
  <body>
    <h1>${data.title}</h1>
    <div class="excerpt">${data.excerpt}</div>
    ${data.image ? `<img src="${data.image}" alt="Featured Image" class="featured-image">` : ''}
    <div class="content">${paragraphs}</div>
    
    <div class="metadata-info">
      <p>Created: ${new Date().toLocaleString()}</p>
    </div>
  </body>
  </html>
  `;
};

const generateMarkdownContent = (data: {
  title: string;
  excerpt: string;
  content: string;
}) => {
  return `# ${data.title}

> ${data.excerpt}

${data.content}

---
*Created: ${new Date().toLocaleString()}*
*Type: Article*`;
};

const uploadToPinata = async (files: { name: string; blob: Blob }[]) => {
  const jwtToken = import.meta.env.VITE_PINATA_JWT;
  if (!jwtToken) {
    throw new Error('VITE_PINATA_JWT environment variable is not set');
  }

  try {
    console.log('Uploading files to Pinata...');

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file.blob, file.name);

      const metadata = JSON.stringify({
        name: file.name,
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1,
      });
      formData.append('pinataOptions', options);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Pinata API Error:', {
          status: res.status,
          statusText: res.statusText,
          response: data
        });

        throw new Error(`Pinata API Error (${res.status}): ${data.error?.details ?? data.message ?? 'Unknown error'}`);
      }

      return { name: file.name, cid: data.IpfsHash };
    });

    const results = await Promise.all(uploadPromises);
    console.log('All uploads successful:', results);
    return results;

  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
};

interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  mintPrice: string;
  metadataURI?: ValidMetadataURI;
  articleURI?: string;
  imageURI?: string;
  markdownURI?: string;
}

const getPMTokenName = (title: string): string => {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
  return `PM-${initials}`;
};

export const CreateArticleForm: React.FC = () => {
  const [formData, setFormData] = useState<ArticleData>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    mintPrice: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<React.ReactNode>(null);
  const [articleCreated, setArticleCreated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    setCreateSuccess(null);

    try {
      const filesToUpload: { name: string; blob: Blob }[] = [];

      const htmlContent = generateArticleHTML({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        mintPrice: formData.mintPrice
      });
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      filesToUpload.push({
        name: 'article.html',
        blob: htmlBlob
      });

      const markdownContent = generateMarkdownContent({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content
      });
      const markdownBlob = new Blob([markdownContent], { type: 'text/markdown' });
      filesToUpload.push({
        name: 'article.md',
        blob: markdownBlob
      });

      let imageFile: File | undefined;
      if (formData.image) {
        const mimeType = formData.image.split(';')[0].split(':')[1];
        const imageBlob = base64ToBlob(formData.image, mimeType);
        const extension = mimeType.split('/')[1];
        imageFile = new File([imageBlob], `featured-image.${extension}`, { type: mimeType });
      }

      const uploadResults = await uploadToPinata(filesToUpload);
      const htmlResult = uploadResults.find(r => r.name === 'article.html');
      const markdownResult = uploadResults.find(r => r.name === 'article.md');

      if (!htmlResult || !markdownResult) {
        throw new Error('Failed to upload article files');
      }

      const articleURI = `ipfs://${htmlResult.cid}`;
      const markdownURI = `ipfs://${markdownResult.cid}`;

      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet to create an article.");
      }

      const uploader = createZoraUploaderForCreator(address);
      const metadataBuilder = createMetadataBuilder()
        .withName(formData.title)
        .withSymbol(formData.title.slice(0, 4).toUpperCase())
        .withDescription(formData.excerpt)
        .withProperties({
          article_content: formData.content,
          article_excerpt: formData.excerpt,
          article_html_cid: htmlResult.cid,
          article_markdown_cid: markdownResult.cid,
          article_html_uri: articleURI,
          article_markdown_uri: markdownURI,
          content_type: 'article',
          content_length: formData.content.length.toString(),
          created_at: new Date().toISOString(),
          mint_price: formData.mintPrice
        });

      if (imageFile) {
        metadataBuilder.withImage(imageFile);
      }

      metadataBuilder.withMediaURI(articleURI, 'text/html');
      const { url: metadataURI, metadata } = await metadataBuilder.upload(uploader);

      setFormData({
        ...formData,
        metadataURI,
        articleURI,
        markdownURI
      });

      setArticleCreated(true);
      setCreateSuccess(`Article uploaded successfully.`);

      console.log("Article HTML CID:", htmlResult.cid);
      console.log("Article Markdown CID:", markdownResult.cid);
      console.log("Metadata URI:", metadataURI);
      console.log("Generated metadata:", metadata);

    } catch (err: any) {
      setError(err.message ?? "Failed to create article");
      console.error("Creation error:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleMintArticle = async () => {
    if (!formData.metadataURI || !address || !walletClient) {
      setError("Article not created or wallet not connected");
      return;
    }

    setMintLoading(true);
    setError(null);
    setMintSuccess(null);

    try {
      console.log("Starting mint process...");
      console.log("Wallet client:", walletClient);
      console.log("Address:", address);
      console.log("Chain:", walletClient.chain);

      const pmName = getPMTokenName(formData.title);
      const coinData = {
        name: pmName,
        symbol: pmName,
        uri: formData.metadataURI,
        description: formData.excerpt,
        payoutRecipient: address,
        chainId: base.id,
        currency: DeployCurrency.ETH,
        version: "v4",
        initialPurchaseWei: parseEther(formData.mintPrice ?? "0.001")
      };
      console.log("Creating coin with data:", coinData);

      const tx = await createCoin(coinData, walletClient, publicClient, {
        gasMultiplier: 120,
      });

      setMintSuccess(
        <span>
          Article minted successfully!<br />
          <a
            href={`https://basescan.org/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Transaction
          </a><br />
          <a
            href={formData.articleURI?.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Article
          </a><br />
        </span>
      );
      console.log("Coin created:", tx);

      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        mintPrice: '',
      });
      setImagePreview(null);
      setArticleCreated(false);

    } catch (err: any) {
      console.error("Mint error details:", err);
      let errorMessage = "Failed to mint article";

      if (err.message?.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setMintLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Article</h2>
      <form onSubmit={handleCreateArticle} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter Article title..."
            required
            disabled={articleCreated}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Brief description of the article..."
            required
            disabled={articleCreated}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Write your content here..."
            required
            disabled={articleCreated}
          />
        </div>

        <div>
          <label htmlFor="featured-image-upload" className="block text-sm font-medium text-gray-700 mb-2">
            <Image size={16} className="inline mr-2" />
            Featured Image
          </label>
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors duration-200 ${!articleCreated ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
            onClick={!articleCreated ? handleUploadAreaClick : undefined}
          >
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            {!imagePreview && (
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop your image
              </p>
            )}
            <input
              id="featured-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={articleCreated}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mx-auto mt-4 max-h-40 rounded-lg border"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="mint-price" className="block text-sm font-medium text-gray-700 mb-2">
              <Coins size={16} className="inline mr-2" />
              Mint Price (ETH)
            </label>
            <input
              id="mint-price"
              type="number"
              step="0.001"
              value={formData.mintPrice}
              onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.01"
              required
              disabled={articleCreated}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          {!articleCreated && (
            <button
              type="submit"
              disabled={createLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
            >
              <FileText size={16} className="mr-2" />
              {createLoading ? 'Creating Article...' : 'Create Article'}
            </button>
          )}

          {articleCreated && (
            <button
              type="button"
              onClick={handleMintArticle}
              disabled={mintLoading || !address}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
            >
              <Zap size={16} className="mr-2" />
              {mintLoading ? 'Minting...' : 'Mint Article'}
            </button>
          )}
        </div>

        {createLoading && (
          <div className="text-blue-600 mb-2 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Creating article files and uploading to IPFS...
          </div>
        )}

        {mintLoading && (
          <div className="text-purple-600 mb-2 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            Minting article (check your wallet for signature request)...
          </div>
        )}

        {error && (
          <div className="text-red-600 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {createSuccess && (
          <div className="text-green-600 mb-2 p-3 bg-green-50 border border-green-200 rounded-lg whitespace-pre-line">
            {createSuccess}
            {formData.articleURI && (
              <div className="mt-2 text-sm space-y-1">
                <div>
                  <a
                    href={formData.articleURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline ml-2"
                  >
                    View
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {mintSuccess && (
          <div className="text-green-600 mb-2 p-3 bg-green-50 border border-green-200 rounded-lg whitespace-pre-line">
            {mintSuccess}
          </div>
        )}

        {!address && (
          <div className="text-orange-600 mb-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            Please connect your wallet to mint the article.
          </div>
        )}
      </form>
    </div>
  );
};