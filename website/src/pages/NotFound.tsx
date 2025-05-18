import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/api/endpoints";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const NotFound = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    joinWaitlist(values.email);
    console.log(values);
    toast({
      title: "Thanks for joining!",
      description: "We'll notify you when Clickr launches.",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-6">
          <img
            src="/gifs/engineer.gif"
            alt="Page under construction"
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>
        <p className="text-xl text-gray-600 mb-4">
          This page isn't quite ready yet, join the waitlist!
        </p>
        <div className="glass-panel p-6 backdrop-blur-lg max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-clickr-light-blue hover:bg-clickr-light-blue/90"
              >
                Join the waitlist
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
