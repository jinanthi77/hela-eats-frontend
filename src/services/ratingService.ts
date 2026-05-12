import apiClient from '../api/client';

export interface Testimonial {
  _id: string;
  rating: number;
  review: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: { url: string | null; publicId: string | null };
  };
  recipe: {
    _id: string;
    title: string;
    imageUrl?: string;
  };
  createdAt: string;
}

export interface CreateRatingPayload {
  recipeId: string;
  rating: number;
  review?: string;
}

export const createRating = async (payload: CreateRatingPayload) => {
  const { data } = await apiClient.post('/ratings', payload);
  return data;
};

export const getTestimonials = async (limit = 10): Promise<Testimonial[]> => {
  const { data } = await apiClient.get<Testimonial[]>(`/ratings/testimonials?limit=${limit}`);
  return data;
};
