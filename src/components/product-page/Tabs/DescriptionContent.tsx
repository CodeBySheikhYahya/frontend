import React from "react";

interface DescriptionContentProps {
  description: string;
}

const DescriptionContent = ({ description }: DescriptionContentProps) => {
  return (
    <section className="min-w-0 overflow-hidden">
      <p className="text-sm sm:text-base text-black/80 leading-relaxed whitespace-pre-line break-words break-all">
        {description}
      </p>
    </section>
  );
};

export default DescriptionContent;
