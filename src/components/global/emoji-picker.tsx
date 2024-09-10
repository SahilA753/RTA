import React from 'react';
import dynamic from 'next/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Define the types for the props
interface EmojiPickerProps {
  children: React.ReactNode; // The trigger element (e.g., a button)
  getValue?: (emoji: string) => void; // Callback to pass the selected emoji
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  // Dynamically import the emoji picker library for optimized loading
  const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });

  // Handle emoji selection
  const handleEmojiClick = async (selectedEmoji: any) => {
    if (getValue) {
      await getValue(selectedEmoji.emoji);
      console.log(selectedEmoji.emoji) // Pass the selected emoji to the parent component
    }
  };

  return (
    <div className="flex items-center">
      {/* Popover component to show the emoji picker when triggered */}
      <Popover>
        <PopoverTrigger className="cursor-pointer">
          {children} {/* This is the trigger element, like a button */}
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker onEmojiClick={handleEmojiClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
