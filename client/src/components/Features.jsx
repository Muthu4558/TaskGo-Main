import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AccordionItem = ({ title, sections, isOpen, onClick }) => (
  <div className="border border-gray-300 rounded-xl shadow-md overflow-hidden transition-transform duration-300">
    <button
      className="w-full text-left p-5 flex justify-between items-center bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors duration-300 rounded-t-xl"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <span className={`ml-2 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </span>
    </button>
    {isOpen && (
      <div className="p-5 bg-white/10 backdrop-blur-md rounded-b-xl">
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            {section.contentTitle && <h4 className="text-md font-bold text-white mb-2">{section.contentTitle}</h4>}
            <p className="text-white/80">{section.content}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Features = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData = [
    { title: 'Admin Features', sections: [{ contentTitle: 'Admin Capabilities', content: 'Manage users, tasks, and oversee activities with admin controls.' }] },
    { title: 'User Features', sections: [{ contentTitle: 'User Capabilities', content: 'Create, update, and manage tasks seamlessly with an intuitive dashboard.' }] },
    { title: 'General Features', sections: [{ content: 'Secure authentication, real-time updates, and intuitive UI for easy navigation.' }] },
    { title: 'Profile Management', sections: [{ content: 'Users can modify personal information, change passwords, and customize settings.' }] },
    { title: 'Password Management', sections: [{ content: 'Ensure secure password storage with encryption and easy recovery options.' }] },
    { title: 'For Admin Dashboard', sections: [{ content: 'Track user activities, filter tasks, and oversee all projects effortlessly.' }] },
    { title: 'For User Dashboard', sections: [{ content: 'Personalized task management and real-time updates on assigned tasks.' }] }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 my-20 bg-gradient-to-br from-[#229ea6] to-[#668f92] rounded-3xl shadow-xl text-white">
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">Features</h2>
      <div className="space-y-4">
        {accordionData.map((item, index) => (
          <AccordionItem
            key={index}
            title={item.title}
            sections={item.sections}
            isOpen={openIndex === index}
            onClick={() => toggleAccordion(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Features;