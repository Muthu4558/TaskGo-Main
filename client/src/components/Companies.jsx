import React from 'react';
import logo1 from '../assets/images/WebsiteImg/mamLogo.jpeg';
import logo2 from '../assets/images/WebsiteImg/nizcare-logo.png';
import logo3 from '../assets/images/WebsiteImg/mamse.png';

const Companies = () => {
    const logos = [logo2, logo1, logo3];
    
    return (
        <div className='py-20 bg-gray-100 text-center'>
            <h2 className='text-4xl md:text-6xl font-extrabold text-gray-800 mb-10'>Brands that Trust Us</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 items-center justify-center">
                {logos.map((logo, index) => (
                    <div key={index} className="bg-white shadow-lg rounded-2xl flex items-center justify-center p-8 transition-transform transform hover:scale-105 h-32">
                        <img src={logo} alt={`Company ${index + 1}`} className="max-w-[150px] h-auto object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Companies;
