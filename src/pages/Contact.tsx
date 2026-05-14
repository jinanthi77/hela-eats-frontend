import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-500">
          Have questions or feedback? We'd love to hear from you. Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 mx-auto bg-brand-light rounded-full flex items-center justify-center mb-4 text-brand">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
          <p className="text-gray-500 text-sm">Drop us a line anytime at</p>
          <a href="mailto:support@helaeats.com" className="text-brand font-medium mt-2 inline-block hover:underline">support@helaeats.com</a>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 mx-auto bg-brand-light rounded-full flex items-center justify-center mb-4 text-brand">
            <Phone size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Phone</h3>
          <p className="text-gray-500 text-sm">Call us during business hours</p>
          <a href="tel:+94771234567" className="text-brand font-medium mt-2 inline-block hover:underline">+94 77 123 4567</a>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 mx-auto bg-brand-light rounded-full flex items-center justify-center mb-4 text-brand">
            <MapPin size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Address</h3>
          <p className="text-gray-500 text-sm">Visit our headquarters at</p>
          <span className="text-brand font-medium mt-2 inline-block">123, Galle Road, Colombo</span>
        </div>

        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="w-12 h-12 mx-auto bg-brand-light rounded-full flex items-center justify-center mb-4 text-brand">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Hours</h3>
          <p className="text-gray-500 text-sm">Our support hours</p>
          <span className="text-brand font-medium mt-2 inline-block">Mon-Fri: 9AM - 6PM</span>
        </div>
      </div>

      <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send us a Message</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" id="name" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" id="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-colors" placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" id="subject" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-colors" placeholder="How can we help you?" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea id="message" rows={4} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand outline-none transition-colors" placeholder="Your message here..."></textarea>
          </div>
          <button onClick={() => alert('Message sent successfully!')} type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-3 rounded-lg transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
