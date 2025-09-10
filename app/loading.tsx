import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="h-screen flex flex-col gap-y-4 items-center justify-center">
      <Loader
        className="w-6 h-6 animate-spin text-muted-foreground"
        aria-label="Loading..."
      />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

export default LoadingPage;
