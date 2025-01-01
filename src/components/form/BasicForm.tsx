"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, FormProvider } from "react-hook-form"; // Import FormProvider
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import axios from "axios";
interface FormData {
  name: string;
  birthdate: Date;
  path: string[];
  education: "" | undefined;
}

export default function BasicForm() {
  const formMethods = useForm<FormData>({
    defaultValues: {
      name: "",
      birthdate: new Date(),
      education: undefined,
      path: [],
    },
  });
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      console.log("data: \n ", data);
      const response = await axios.post("/api/user/profile", {
        data: {
          name: data.name,
          birthdate: data.birthdate,
          education: data.education,
          path: data.path,
        },
      });
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  type Checked = DropdownMenuCheckboxItemProps["checked"];
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);
  const handleCheckboxChange = (checked: boolean, value: string) => {
    const currentPath = formMethods.getValues("path") || [];
    if (checked) {
      // Add to array if checked
      formMethods.setValue("path", [...currentPath, value]);
    } else {
      // Remove from array if unchecked
      formMethods.setValue(
        "path",
        currentPath.filter((item) => item !== value)
      );
    }
  };
  const paths = ["Software", "Marketing", "Business"];
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full border border-black">
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <FormField
            control={formMethods.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-nowrap items-center justify-left align-middle gap-3">
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input className="w-fit" placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={formMethods.control}
            name="birthdate"
            render={() => (
              <FormItem>
                <FormLabel>{`Date of Birth : `}</FormLabel>
                <FormControl>
                  <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        {date?.toLocaleDateString() ?? "Pick a date"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select a Date</DialogTitle>
                        <DialogDescription>
                          Pick a date from the calendar.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center justify-center align-middle w-full">
                        {" "}
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <hr className="pb-2 mt-2" />
          <FormField
            control={formMethods.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-nowrap items-center justify-left align-middle gap-3">
                  <FormLabel>Education</FormLabel>

                  <FormControl>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {formMethods.getValues().education === undefined
                            ? "Select"
                            : formMethods.getValues().education}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Education</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <DropdownMenuRadioItem value="Secondary">
                            Secondary
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Senior Secondary">
                            Senior Secondary
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Bachelor's">
                            Bachelor's
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Master's">
                            Master's
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="PHD">
                            PhD
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                </div>
                <FormDescription>
                  Please enter your highest level of education
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <hr className="pb-2 mt-2" />
          <FormField
            control={formMethods.control}
            name="path"
            render={() => (
              <FormItem>
                <FormLabel>Path : </FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">Select Paths</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>Paths</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {paths.map((path) => (
                        <DropdownMenuCheckboxItem
                          key={path}
                          checked={formMethods
                            .getValues("path")
                            ?.includes(path)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(checked, path)
                          }
                        >
                          {path}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <hr className="pb-2 mt-2" />
          <Button type="submit" className="mt-4 w-full">
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
