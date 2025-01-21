"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "NextRound's technical interview preparation was instrumental in helping me land my dream job. The AI-powered feedback system helped me identify and improve my weak areas.",
    },
    {
      name: "Michael Rodriguez",
      role: "Product Manager at Meta",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The cultural fit assessment gave me invaluable insights into company cultures. I was much more confident in my interviews knowing I aligned well with the company values.",
    },
    {
      name: "Emily Watson",
      role: "Data Scientist at Amazon",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The combination of technical and behavioral interview preparation made all the difference. I felt prepared for every aspect of the interview process.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from candidates who landed their dream jobs with NextRound.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">{testimonial.quote}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
