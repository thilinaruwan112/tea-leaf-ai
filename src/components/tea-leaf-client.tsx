"use client";

import { analyzeLeafImageAndReturnConditionIndicators, type AnalyzeLeafImageAndReturnConditionIndicatorsOutput } from "@/ai/flows/analyze-leaf-image-and-return-condition-indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Leaf, Loader2, RefreshCw, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

export function TeaLeafClient() {
  const [analysis, setAnalysis] = useState<AnalyzeLeafImageAndReturnConditionIndicatorsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an image file to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataUri = await fileToDataUri(file);
      const result = await analyzeLeafImageAndReturnConditionIndicators({ leafImageDataUri: dataUri });
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setAnalysis(null);
    setPreviewUrl(null);
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center gap-4 p-8 rounded-lg bg-card/80 backdrop-blur-sm">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-2xl font-bold font-headline">Analyzing...</h2>
        <p className="text-muted-foreground">Our AI is inspecting your tea leaf. Please wait a moment.</p>
      </div>
    );
  }

  if (analysis && previewUrl) {
    return (
      <Card className="w-full max-w-4xl mx-auto animate-in fade-in-50 duration-500">
        <CardHeader>
            <CardTitle className="font-headline text-3xl">Analysis Complete</CardTitle>
            <CardDescription>Here are the results of your tea leaf analysis.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/20 shadow-md relative">
              <Image src={previewUrl} alt="Uploaded tea leaf" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold font-headline mb-3 text-foreground/90">Condition Indicators</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.conditionIndicators.map((indicator, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3 border-accent/30 bg-accent/10 text-accent-foreground shadow-sm">
                    <Leaf className="mr-2 h-3.5 w-3.5"/>
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-xl font-bold font-headline mb-3 text-foreground/90">Recommended Actions</h3>
              <div className="bg-background/50 p-4 rounded-lg border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{analysis.recommendedActions}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleReset} size="lg" className="w-full md:w-auto mx-auto md:ml-auto md:mr-0">
                <RefreshCw className="mr-2 h-4 w-4" /> Analyze Another Leaf
            </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto transform transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">Analyze Your Tea Leaf</CardTitle>
        <CardDescription>Upload an image to get an AI-powered health assessment and recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        {previewUrl ? (
            <div className="relative w-full aspect-video rounded-md overflow-hidden group border-2 border-dashed border-primary/50">
                <Image src={previewUrl} alt="Image preview" layout="fill" objectFit="contain" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="destructive" size="icon" onClick={handleReset}>
                        <X className="h-5 w-5"/>
                        <span className="sr-only">Remove image</span>
                    </Button>
                </div>
            </div>
        ) : (
            <div
            className={cn(
              "relative flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300",
              isDragging && "border-primary bg-primary/10"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-muted-foreground">
              <UploadCloud className="w-10 h-10 mb-4" />
              <p className="mb-2 text-sm font-semibold text-foreground">Click or drag & drop to upload</p>
              <p className="text-xs">PNG, JPG, or GIF (max 4MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full" size="lg">
          <Leaf className="mr-2 h-5 w-5" />
          Analyze Leaf
        </Button>
      </CardFooter>
    </Card>
  );
}
