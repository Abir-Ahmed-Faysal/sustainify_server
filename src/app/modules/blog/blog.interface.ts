export interface IBlogCreatePayload {
  title: string;
  slug: string;
  content: string;
  image?: string;
  isPublished?: boolean;
}

export interface IBlogUpdatePayload {
  title?: string;
  slug?: string;
  content?: string;
  image?: string;
  isPublished?: boolean;
}
