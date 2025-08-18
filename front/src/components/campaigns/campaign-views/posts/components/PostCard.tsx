import { Card, CardContent } from "@/components/ui/card";
import { InfluencerPost } from "@/lib/services/influencer-posts";
import { PostImage } from "./PostImage";
import { PostInfluencerInfo } from "./PostInfluencerInfo";
import { PostTitle } from "./PostTitle";
import { PostMetrics } from "./PostMetrics";
import { PostActions } from "./PostActions";
import { extractMetricsFromRawResponse, extractPostTitle, getImageUrl } from "./PostUtils";
import { useState, useEffect } from "react";

interface PostCardProps {
  post: InfluencerPost;
  sentiment?: 'Positivo' | 'Negativo' | 'Neutral';
  sentimentLoading?: boolean;
  onDelete: (postId: string, caption?: string) => void;
  onAnalyze: (postUrl: string, postImage?: string, platform?: string, postId?: string, postData?: any) => void;
}

export const PostCard = ({ post, sentiment, sentimentLoading, onDelete, onAnalyze }: PostCardProps) => {
  const metrics = extractMetricsFromRawResponse(post);
  const postTitle = extractPostTitle(post);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Cargar la imagen de forma asíncrona
  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await getImageUrl(post);
        setImageUrl(url);
      } catch (error) {
        console.error('Error cargando imagen:', error);
        setImageUrl(post.image_url || '');
      }
    };
    
    loadImage();
  }, [post]);

  const handleDelete = () => {
    onDelete(post.id, post.caption);
  };

  const handleAnalyze = () => {
    onAnalyze(post.post_url, imageUrl || undefined, post.platform, post.id, post);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 rounded-lg flex flex-col h-full min-h-[24rem]">
      {/* Imagen del post */}
      <PostImage 
        imageUrl={imageUrl || undefined}
        postUrl={post.post_url}
        onDelete={handleDelete}
        postData={post} // Pasar los datos completos del post
      />

      <CardContent className="flex-1 p-3 pb-2 flex flex-col">
        {/* Información del influencer */}
        <PostInfluencerInfo 
          post={post}
          uploadDate={metrics.uploadDate}
        />

        {/* Título/descripción del post */}
        <PostTitle title={postTitle} />

        {/* Métricas de engagement */}
        <PostMetrics 
          views={metrics.views}
          likes={metrics.likes}
          comments={metrics.comments}
          platform={post.platform}
          postUrl={post.post_url}
        />

        {/* Fila inferior con sentimiento y botón de análisis */}
        <PostActions 
          sentiment={sentiment}
          sentimentLoading={sentimentLoading}
          platform={post.platform}
          onAnalyze={handleAnalyze}
          postUrl={post.post_url}
          metrics={metrics}
        />
      </CardContent>
    </Card>
  );
}; 