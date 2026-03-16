import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
}

const StarRating = ({ rating, max = 5 }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-star-filled text-star-filled"
              : "fill-star-empty text-star-empty"
          }`}
        />
      ))}
    </div>
  );
};

export default StarRating;
