import React from 'react';

const testimonialsData = [
  {
    quote: "Lore brought our family's history to life. The AI photo analysis uncovered stories we never knew. It's like having a personal historian.",
    name: 'Sarah J.',
    role: 'Family Archivist',
    avatar: 'https://picsum.photos/id/237/100/100',
  },
  {
    quote: "As a coach, I used Lore to build a visual history for our team. It's been an incredible tool for bonding and celebrating our legacy.",
    name: 'Michael B.',
    role: 'Community Leader',
    avatar: 'https://picsum.photos/id/238/100/100',
  },
    {
    quote: "I've tried other genealogy sites, but Lore is different. It's so intuitive and focuses on the stories, not just the data. Highly recommended!",
    name: 'Emily R.',
    role: 'Genealogy Enthusiast',
    avatar: 'https://picsum.photos/id/239/100/100',
  },
];

const TestimonialCard: React.FC<typeof testimonialsData[0]> = ({ quote, name, role, avatar }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full">
        <p className="text-slate-300 mb-6 flex-grow">"{quote}"</p>
        <div className="flex items-center">
            <img className="h-12 w-12 rounded-full object-cover" src={avatar} alt={name} />
            <div className="ml-4">
                <p className="font-bold text-slate-100">{name}</p>
                <p className="text-sm text-slate-400">{role}</p>
            </div>
        </div>
    </div>
);

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100">Loved by Families & Communities</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">Don't just take our word for it. Here's what our users are saying.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
                <TestimonialCard key={index} {...testimonial} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
