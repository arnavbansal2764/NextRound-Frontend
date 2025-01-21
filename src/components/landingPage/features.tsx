"use client";

import { motion } from "framer-motion";
import { Code2, Users2, Brain, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Features() {
  const features = [
    {
      icon: <Code2 className="h-8 w-8 text-purple-500" />,
      title: "Technical Interview Preparation",
      description:
        "Practice coding challenges, system design questions, and get real-time feedback on your solutions.",
      items: [
        "In-depth code analysis",
        "System design exercises",
        "Algorithm optimization tips",
        "Real-world problem scenarios",
      ],
    },
    {
      icon: <Users2 className="h-8 w-8 text-blue-500" />,
      title: "Behavioral Interview Training",
      description:
        "Master the art of behavioral interviews with our comprehensive preparation system.",
      items: [
        "STAR method coaching",
        "Common question practice",
        "Response structure guidance",
        "Communication skills enhancement",
      ],
    },
    {
      icon: <Brain className="h-8 w-8 text-green-500" />,
      title: "Cultural Fit Assessment",
      description:
        "Understand company cultures and assess your alignment with potential employers.",
      items: [
        "Company values analysis",
        "Work style evaluation",
        "Team dynamics insights",
        "Cultural adaptation strategies",
      ],
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Interview Preparation
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to succeed in your next interview, from
            technical skills to cultural fit.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
