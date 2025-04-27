import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "The staff at House of Cuts are true professionals. Mike gave me the best haircut I've had in years, and the atmosphere is fantastic. Highly recommend!",
    name: "James Wilson",
    title: "Regular Customer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    id: 2,
    text: "I love that I can book online anytime. The premium beard oil I purchased has made a noticeable difference. These guys know their craft!",
    name: "David Chen",
    title: "First-time Customer",
    avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    rating: 5
  },
  {
    id: 3,
    text: "The online booking system is so convenient, and the attention to detail during my haircut was impressive. Alex took his time to understand exactly what I wanted.",
    name: "Michael Smith",
    title: "Monthly Subscriber",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-heading text-center mb-12">WHAT OUR CLIENTS SAY</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex text-secondary mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5" 
                    fill={i < testimonial.rating ? "currentColor" : "none"} 
                  />
                ))}
              </div>
              <p className="text-neutral italic mb-4">{testimonial.text}</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4" 
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-neutral">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
