import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
  DialogClose
} from "../ui/dialog";
import { Star } from "lucide-react";

const RatingModal = ({ open, onOpenChange, onSubmit }) => {
  const [rating, setRating] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Your Ride</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center mt-4 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => setRating(star)}
              className={`h-8 w-8 cursor-pointer transition-colors ${
                star <= rating ? "text-yellow-500" : "text-gray-300"
              }`}
              fill={star <= rating ? "currentColor" : "none"}
            />
          ))}
        </div>
        <DialogFooter className="mt-6">
          <button
            className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              onSubmit(rating);
              onOpenChange(false);
            }}
          >
            Submit
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
