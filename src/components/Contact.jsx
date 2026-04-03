import { useState } from "react";
import { submitContactForm } from "../services/api";
import { 
  Mail, 
  Send, 
  MessageCircle, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await submitContactForm({
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      setSubmitted(true);
      toast({
        title: "Success",
        description: "Your message has been sent successfully. We'll get back to you soon.",
      });
    } catch (error) {
      console.error("❌ Contact submission error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: PhoneCall, label: "Phone", value: "+91 (800) 123-4567", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Mail, label: "Email", value: "support@samadhantra.com", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: MapPin, label: "Office", value: "Innovation Hub, Bengaluru, India", color: "text-indigo-600", bg: "bg-indigo-50" }
  ];

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-100">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Message <span className="text-emerald-600">Delivered</span></h1>
            <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                Thank you for reaching out. Our support team will analyze your request and response shortly.
            </p>
          </div>
          <Button 
            onClick={() => setSubmitted(false)}
            variant="outline" 
            className="rounded-2xl px-10 h-14 font-black border-slate-200 text-slate-600"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Portal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic leading-none">
            Let's Start a <span className="text-blue-600 underline decoration-blue-100 decoration-8 underline-offset-8">Conversatuion</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm max-w-lg">
            Have a question, feedback, or need technical assistance? Fill out the form below and we'll get in touch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          {contactInfo.map((info, i) => (
            <Card key={i} className="border-0 bg-slate-50 rounded-[2.5rem] p-8 flex items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
              <div className={`p-4 rounded-2xl ${info.bg} ${info.color} group-hover:scale-110 transition-transform`}>
                <info.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{info.label}</p>
                <p className="font-black text-slate-800 tracking-tight text-sm">{info.value}</p>
              </div>
            </Card>
          ))}
          
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
             <h4 className="text-xl font-black italic tracking-tight">Need 24/7 Support?</h4>
             <p className="text-slate-400 font-bold text-xs">Our AI-powered assistant is available around the clock to help with common queries.</p>
             <Button variant="outline" className="rounded-xl border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-black text-xs uppercase tracking-widest h-11 w-full mt-2">
                Launch AI Assistant
             </Button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-slate-50 bg-white rounded-[3.5rem] p-8 md:p-14 shadow-2xl shadow-slate-100/50">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Full Name</label>
                  <Input 
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all px-6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <Input 
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all px-6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
                <Input 
                  required
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all px-6"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message</label>
                <Textarea 
                  required
                  placeholder="Tell us what's on your mind..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="min-h-[200px] rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all p-6 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-3" />}
                {loading ? "Sending Message..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
