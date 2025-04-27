import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const AboutContact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('contact', '').toLowerCase()]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, would send this to the server
    toast({
      title: "Message Sent",
      description: "Thanks for contacting us. We'll get back to you soon!",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl font-heading mb-6">ABOUT THE HOUSE OF CUTS</h2>
            <p className="text-neutral mb-4">
              Established in 2015, The House of Cuts has been dedicated to providing premium grooming services for the modern gentleman. 
              Our team of skilled barbers combines traditional techniques with contemporary styles to deliver an exceptional experience.
            </p>
            <p className="text-neutral mb-6">
              We believe that a great haircut is more than just a service – it's an experience. 
              That's why we've created a space where you can relax, socialize, and leave looking and feeling your best.
            </p>
            
            <h3 className="text-2xl font-heading mb-4">Our Location</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="mb-2"><strong>Address:</strong> 123 Main Street, Downtown, New York, NY 10001</p>
              <p className="mb-2"><strong>Phone:</strong> (555) 123-4567</p>
              <p><strong>Email:</strong> info@thehouseofcuts.com</p>
            </div>
            
            <h3 className="text-2xl font-heading mb-4">Hours of Operation</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Monday - Friday:</div>
              <div>9:00 AM - 8:00 PM</div>
              <div>Saturday:</div>
              <div>10:00 AM - 6:00 PM</div>
              <div>Sunday:</div>
              <div>11:00 AM - 4:00 PM</div>
            </div>
          </div>
          
          <div className="md:w-1/2" id="contact">
            <h2 className="text-4xl font-heading mb-6">GET IN TOUCH</h2>
            <p className="text-neutral mb-6">
              Have questions or feedback? We'd love to hear from you. Fill out the form below and our team will get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="contactName" className="block text-neutral font-medium mb-1">Name</label>
                  <Input 
                    type="text" 
                    id="contactName" 
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-neutral font-medium mb-1">Email</label>
                  <Input 
                    type="email" 
                    id="contactEmail" 
                    placeholder="Your email" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="contactSubject" className="block text-neutral font-medium mb-1">Subject</label>
                <Input 
                  type="text" 
                  id="contactSubject" 
                  placeholder="Subject" 
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="contactMessage" className="block text-neutral font-medium mb-1">Message</label>
                <Textarea 
                  id="contactMessage" 
                  rows={5} 
                  placeholder="Your message" 
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="bg-secondary hover:bg-red-700 text-white font-bold">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutContact;
