import React from 'react';

interface ContactCardProps {
    title: string;
    icon: React.ReactNode;
    content: string;
    description: string;
    actionText: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
                                                     title,
                                                     icon,
                                                     content,
                                                     description,
                                                     actionText
                                                 }) => {
    return (
        <div className="contact-card">
            <div className="contact-card-icon">
                {icon}
            </div>
            <h3 className="contact-card-title">{title}</h3>
            <p className="contact-card-content">{content}</p>
            <p className="contact-card-description">{description}</p>
            <a href="#" className="contact-card-action">
                {actionText}
            </a>
        </div>
    );
};

export default ContactCard;