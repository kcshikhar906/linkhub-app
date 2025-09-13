'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const textsToType = [
  'Navigate Bureaucracy, Simplified.',
  'Your guide to essential services.',
  "Find what you need, fast.",
  "Clear, step-by-step guides.",
];

export function TypingEffect() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % textsToType.length;
      const fullText = textsToType[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const typingTimeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(typingTimeout);
  }, [text, isDeleting, typingSpeed, loopNum]);

  return (
    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 font-headline text-white">
      <span className="border-b-4 border-primary pb-2">{text}</span>
      <span className="animate-ping">|</span>
    </h1>
  );
}
