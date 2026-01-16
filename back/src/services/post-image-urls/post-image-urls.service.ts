import supabase from '../../config/supabase';

export interface PostImageUrl {
  id: string;
  post_id: string;
  image_url: string;
  storage_provider?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PostImageUrlCreateDTO {
  post_id: string;
  image_url: string;
  storage_provider?: string;
}

export interface PostImageUrlUpdateDTO {
  image_url?: string;
  storage_provider?: string;
}

export class PostImageUrlService {
  /**
   * Creates or updates a post image URL
   * @param data Post image URL data
   * @returns Created or updated post image URL
   */
  async upsertPostImageUrl(data: PostImageUrlCreateDTO): Promise<PostImageUrl> {
    // Detect storage provider from URL if not provided
    let storageProvider = data.storage_provider;
    if (!storageProvider && data.image_url) {
      if (data.image_url.includes('supabase.co') || data.image_url.includes('/storage/v1/object/public/')) {
        storageProvider = 'supabase';
      } else if (data.image_url.includes('blob.vercel-storage.com')) {
        storageProvider = 'vercel-blob';
      } else if (data.image_url.includes('amazonaws.com') || data.image_url.includes('s3.')) {
        storageProvider = 's3';
      } else if (data.image_url.startsWith('blob:')) {
        storageProvider = 'blob';
      }
    }

    // Use upsert to create or update
    const { data: postImageUrl, error } = await supabase
      .from('post_image_urls')
      .upsert(
        {
          post_id: data.post_id,
          image_url: data.image_url,
          storage_provider: storageProvider,
          updated_at: new Date(),
        },
        {
          onConflict: 'post_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('❌ [PostImageUrlService] Error upserting post image URL:', error);
      throw error;
    }

    return postImageUrl;
  }

  /**
   * Gets post image URL by post ID
   * @param postId Post ID
   * @returns Post image URL or null if not found
   */
  async getPostImageUrlByPostId(postId: string): Promise<PostImageUrl | null> {
    const { data: postImageUrl, error } = await supabase
      .from('post_image_urls')
      .select('*')
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('❌ [PostImageUrlService] Error getting post image URL:', error);
      throw error;
    }

    return postImageUrl;
  }

  /**
   * Gets multiple post image URLs by post IDs
   * @param postIds Array of post IDs
   * @returns Map of post_id to PostImageUrl
   */
  async getPostImageUrlsByPostIds(postIds: string[]): Promise<Map<string, PostImageUrl>> {
    if (!postIds || postIds.length === 0) {
      return new Map();
    }

    const { data: postImageUrls, error } = await supabase
      .from('post_image_urls')
      .select('*')
      .in('post_id', postIds);

    if (error) {
      console.error('❌ [PostImageUrlService] Error getting post image URLs:', error);
      throw error;
    }

    const map = new Map<string, PostImageUrl>();
    (postImageUrls || []).forEach((url) => {
      map.set(url.post_id, url);
    });

    return map;
  }

  /**
   * Updates a post image URL
   * @param postId Post ID
   * @param data Update data
   * @returns Updated post image URL
   */
  async updatePostImageUrl(postId: string, data: PostImageUrlUpdateDTO): Promise<PostImageUrl> {
    const updateData: any = {
      ...data,
      updated_at: new Date(),
    };

    // Detect storage provider if image_url is updated
    if (data.image_url && !data.storage_provider) {
      if (data.image_url.includes('supabase.co') || data.image_url.includes('/storage/v1/object/public/')) {
        updateData.storage_provider = 'supabase';
      } else if (data.image_url.includes('blob.vercel-storage.com')) {
        updateData.storage_provider = 'vercel-blob';
      } else if (data.image_url.includes('amazonaws.com') || data.image_url.includes('s3.')) {
        updateData.storage_provider = 's3';
      } else if (data.image_url.startsWith('blob:')) {
        updateData.storage_provider = 'blob';
      }
    }

    const { data: postImageUrl, error } = await supabase
      .from('post_image_urls')
      .update(updateData)
      .eq('post_id', postId)
      .select()
      .single();

    if (error) {
      console.error('❌ [PostImageUrlService] Error updating post image URL:', error);
      throw error;
    }

    return postImageUrl;
  }

  /**
   * Deletes a post image URL
   * @param postId Post ID
   */
  async deletePostImageUrl(postId: string): Promise<void> {
    const { error } = await supabase
      .from('post_image_urls')
      .delete()
      .eq('post_id', postId);

    if (error) {
      console.error('❌ [PostImageUrlService] Error deleting post image URL:', error);
      throw error;
    }
  }
}
