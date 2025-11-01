import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  Users,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const dummyPeers = [
    { id: 1, name: "Priya Sharma",     city: "Mumbai",      email: "priya.sharma@email.com",      lastActive: "5 days ago",  topic: "machine learning" },
  { id: 2, name: "Rohan Mehta",      city: "Delhi",       email: "rohan.mehta@email.com",       lastActive: "2 days ago",  topic: "data science" },
  { id: 3, name: "Ananya Verma",     city: "Bangalore",   email: "ananya.verma@email.com",     lastActive: "1 day ago",   topic: "machine learning" },
  { id: 4, name: "Karan Patel",      city: "Pune",        email: "karan.patel@email.com",      lastActive: "3 hours ago", topic: "web development" },
  
  { id: 5,  name: "Simran Kaur",     city: "Chennai",     email: "simran.kaur@email.com",      lastActive: "12 hours ago", topic: "DevOps engineering" },
  { id: 6,  name: "Amit Gupta",      city: "Hyderabad",   email: "amit.gupta@email.com",        lastActive: "4 days ago",   topic: "full-stack development" },
  { id: 7,  name: "Neha Reddy",      city: "Bangalore",   email: "neha.reddy@email.com",        lastActive: "6 days ago",   topic: "frontend engineering" },
  { id: 8,  name: "Vikram Singh",    city: "Kolkata",     email: "vikram.singh@email.com",      lastActive: "8 hours ago",   topic: "backend engineering" },
  { id: 9,  name: "Maya Nair",        city: "Mumbai",      email: "maya.nair@email.com",          lastActive: "1 day ago",    topic: "cloud engineering" },
  { id: 10, name: "Rakesh Iyer",     city: "Delhi",       email: "rakesh.iyer@email.com",        lastActive: "10 hours ago",  topic: "data engineering" },
  { id: 11, name: "Priyanka Das",    city: "Pune",        email: "priyanka.das@email.com",       lastActive: "3 days ago",    topic: "QA engineering" },
  { id: 12, name: "Siddharth Rao",   city: "Hyderabad",   email: "siddharth.rao@email.com",      lastActive: "5 hours ago",   topic: "mobile development" },
  { id: 13, name: "Tina Chawla",     city: "Chennai",     email: "tina.chawla@email.com",         lastActive: "2 days ago",    topic: "UX engineering" },
  { id: 14, name: "Varun Mehta",     city: "Bangalore",   email: "varun.mehta@email.com",         lastActive: "7 hours ago",   topic: "site reliability engineering" },
  { id: 15, name: "Anil Kapoor",     city: "Mumbai",      email: "anil.kapoor@email.com",         lastActive: "9 days ago",     topic: "database administration" },
  { id: 16, name: "Deepa Joshi",     city: "Kolkata",     email: "deepa.joshi@email.com",         lastActive: "11 hours ago",  topic: "backend microservices" },
  { id: 17, name: "Gaurav Pandey",   city: "Delhi",       email: "gaurav.pandey@email.com",       lastActive: "14 hours ago",  topic: "API development" },
  { id: 18, name: "Richa Sharma",    city: "Pune",        email: "richa.sharma@email.com",        lastActive: "2 days ago",     topic: "frontend frameworks" },
  { id: 19, name: "Kunal Agarwal",   city: "Hyderabad",   email: "kunal.agarwal@email.com",       lastActive: "4 hours ago",    topic: "infrastructure as code" },
];

const RoadmapGenerator = () => {
  const [topic, setTopic] = useState("");
  const [currentKnowledge, setCurrentKnowledge] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchedPeers, setMatchedPeers] = useState([]);
  const { toast } = useToast();

  const normalize = (text) =>
    text.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();

  useEffect(() => {
    if (!topic.trim()) {
      setMatchedPeers([]);
      return;
    }
    const peers = dummyPeers.filter((peer) =>
      normalize(peer.topic).includes(normalize(topic))
    );
    setMatchedPeers(peers);
  }, [topic]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter what you want to learn",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRoadmap("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-roadmap", {
        body: { topic, currentKnowledge },
      });

      if (error) throw error;
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setRoadmap(data.roadmap);
      toast({
        title: "Success!",
        description: "Your personalized roadmap is ready",
      });
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Trigger on Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault(); // prevent accidental form submission
      handleGenerate();
    }
  };

  const formatRoadmap = (text) => {
    if (!text) return null;
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return lines.map((line, index) => {
      const withLinks = line.replace(
        /(https?:\/\/[^\s]+)/g,
        (url) =>
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">${url}</a>`
      );

      if (/month\s*\d+/i.test(line)) {
        return (
          <h3
            key={index}
            className="text-2xl font-semibold mt-6 mb-3 text-primary border-b border-border pb-1"
            dangerouslySetInnerHTML={{ __html: withLinks }}
          />
        );
      }

      if (/^[-*•]/.test(line.trim())) {
        return (
          <li
            key={index}
            className="leading-relaxed text-muted-foreground ml-4"
            dangerouslySetInnerHTML={{
              __html: withLinks.replace(/^[-*•]\s*/, ""),
            }}
          />
        );
      }

      return (
        <p
          key={index}
          className="leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: withLinks }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-2 animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            AI-Powered <span className="text-gradient">Roadmap Generator</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get a structured, multi-month learning plan tailored to your goals - also get connected with peers on the same path!
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-8 border-border bg-card card-glow mb-8 animate-fade-in">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-base">
                What do you want to learn?
              </Label>
              <Input
                id="topic"
                placeholder="e.g., Full Stack Web Development, Machine Learning..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyPress} // ✅ Enter triggers roadmap
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="knowledge" className="text-base">
                What do you already know? (Optional)
              </Label>
              <Textarea
                id="knowledge"
                placeholder="e.g., I know HTML/CSS basics and some JS..."
                value={currentKnowledge}
                onChange={(e) => setCurrentKnowledge(e.target.value)}
                onKeyDown={handleKeyPress} // ✅ Enter triggers roadmap here too
                className="bg-background/50 border-border min-h-[120px]"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Peer Up Section */}
        {matchedPeers.length > 0 && (
          <Card className="p-8 border-border bg-card card-glow mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" /> Peers Learning {topic}
            </h3>
            <p className="text-muted-foreground mb-4">
              {matchedPeers.length} learner(s) currently exploring{" "}
              <strong>{topic}</strong>. Connect and grow together!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedPeers.map((peer) => (
                <Card
                  key={peer.id}
                  className="p-4 border border-border/40 bg-background/60 hover:shadow-md transition rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-lg">{peer.name}</p>
                      <p className="text-sm text-muted-foreground">{peer.city}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                        <Mail className="h-3 w-3" /> {peer.email}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active {peer.lastActive}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-primary hover:text-white transition"
                    >
                      Connect
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Roadmap Display */}
        {roadmap && (
          <Card className="p-8 border-border bg-card card-glow animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Your Personalized Roadmap
            </h2>
            <div className="prose prose-invert max-w-none space-y-3">
              <ul className="list-disc list-inside space-y-2">
                {formatRoadmap(roadmap)}
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;
