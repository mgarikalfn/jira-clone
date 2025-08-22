import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <div>
      <Button variant="destructive" size="lg">click here</Button>
      <Button  size="lg">primary here</Button>
      <Button variant="ghost" size="lg">ghost here</Button>
      <Button variant="muted" size="lg">muted here</Button>
      <Button variant="outline" size="lg">click here</Button>
      <Button variant="secondary" size="lg">secondary here</Button>
      <Button variant="teritary" size="lg">teritary here</Button>
      <h2 className="bg-gray-400 text-4xl" >hello world</h2>
    </div>
  );
}
