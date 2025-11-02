  import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RoadmapGenerator = () => {
  const [topic, setTopic] = useState("");
  const [currentKnowledge, setCurrentKnowledge] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRoadmap, setParsedRoadmap] = useState([]);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("roadmapProgress"));
    if (saved) setParsedRoadmap(saved);
  }, []);

  useEffect(() => {
    if (parsedRoadmap.length > 0) {
      localStorage.setItem("roadmapProgress", JSON.stringify(parsedRoadmap));
      const completed = parsedRoadmap.filter((w) => w.completed).length;
      setProgress((completed / parsedRoadmap.length) * 100);
    }
  }, [parsedRoadmap]);

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
    setParsedRoadmap([]);

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

      const extracted = parseWeeks(data.roadmap);
      setParsedRoadmap(extracted);
      toast({
        title: "Success!",
        description: "Detailed roadmap generated successfully 🚀",
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

  // Improved week parser that captures detailed weekly info
  const parseWeeks = (text) => {
    const lines = text.split("\n");
    const weeks = [];
    let currentWeek = null;

    lines.forEach((line) => {
      const weekMatch = line.match(/week\s*(\d+):?\s*(.*)/i);
      if (weekMatch) {
        if (currentWeek) weeks.push(currentWeek);
        currentWeek = {
          week: weekMatch[1],
          title: weekMatch[2] || "Untitled",
          details: [],
          completed: false,
          projectLink: "",
        };
      } else if (currentWeek && line.trim() !== "") {
        currentWeek.details.push(line.trim());
      }
    });

    if (currentWeek) weeks.push(currentWeek);
    return weeks;
  };

  const toggleWeekCompletion = (index) => {
    setParsedRoadmap((prev) =>
      prev.map((w, i) => (i === index ? { ...w, completed: !w.completed } : w))
    );
  };

  const handleProjectLinkChange = (index, value) => {
    setParsedRoadmap((prev) =>
      prev.map((w, i) => (i === index ? { ...w, projectLink: value } : w))
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-4">
          AI-Powered <span className="text-gradient">Roadmap Tracker</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Generate a roadmap and track your weekly progress.
        </p>

        {/* Input Section */}
        <Card className="p-8 border-border bg-card mb-8">
          <div className="space-y-6">
            <div>
              <Label>What do you want to learn?</Label>
              <Input
                placeholder="e.g. Frontend Development, Machine Learning..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
            <div>
              <Label>Your current knowledge (optional)</Label>
              <Textarea
                placeholder="e.g. I know HTML/CSS basics..."
                value={currentKnowledge}
                onChange={(e) => setCurrentKnowledge(e.target.value)}
                onKeyDown={handleKeyPress}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Progress Tracker */}
        {parsedRoadmap.length > 0 && (
          <Card
            className="p-8 border-border bg-card mb-8 transition-all duration-300 cursor-pointer hover:shadow-lg"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Overall Progress: {Math.round(progress)}%
                </h3>
                <Progress value={progress} className="h-3" />
              </div>
              {expanded ? (
                <ChevronUp className="h-6 w-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {expanded && (
              <div className="mt-8 space-y-4 animate-fadeIn">
                {parsedRoadmap.map((week, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/40 bg-background/60"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Week {week.week}: {week.title}
                        </h3>
                        <ul className="list-disc ml-6 text-sm text-muted-foreground">
                          {week.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 items-center mt-2 sm:mt-0">
                        <Input
                          placeholder="Add project link"
                          value={week.projectLink}
                          onChange={(e) =>
                            handleProjectLinkChange(index, e.target.value)
                          }
                        />
                        <Button
                          variant={week.completed ? "success" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWeekCompletion(index);
                          }}
                        >
                          {week.completed ? "Completed ✅" : "Mark Done"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoadmapGenerator;
  