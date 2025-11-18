import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Page() {
  return (
    <main className="w-screen min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Successfully Onboarded!</CardTitle>
            <CardDescription className="text-base">
              Welcome aboard! Your account has been set up successfully. You're
              all set to get started.
            </CardDescription>
          </CardHeader>
          {/* <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              You can now access all features and start using the platform.
            </p>
          </CardContent> */}
          {/* <CardFooter className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full">
              <Link href="/">Get Started</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/onboard">Review Settings</Link>
            </Button>
          </CardFooter> */}
        </Card>
      </div>
    </main>
  );
}
