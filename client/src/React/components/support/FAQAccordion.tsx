import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-accordion">
            {items.map((item, index) => (
                <div key={index} className="faq-item">
                    <div
                        className={`faq-question ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => toggleAccordion(index)}
                    >
                        {item.question}
                        <ChevronDown className="chevron" size={20} />
                    </div>
                    <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                        <p>{item.answer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FAQAccordion;