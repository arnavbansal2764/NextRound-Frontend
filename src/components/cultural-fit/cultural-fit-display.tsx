"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { motion } from 'framer-motion';
import { Emotion, Segment, SegmentSecondaryTrait, Trait } from '@/lib/redis/types';

interface CulturalFitAnalysisProps {
  result: string;
  primary_traits: Segment[];
  segment_secondary_traits: SegmentSecondaryTrait[];
}

const CulturalFitAnalysis: React.FC<{ data: CulturalFitAnalysisProps }> = ({ data }) => {
  const renderEmotions = (emotions: Emotion[]) => {
    return emotions.map((emotion, index) => (
      <li key={index}>
        {emotion.emotion_name}: {emotion.emotion_score.toFixed(2)}
      </li>
    ));
  };

  const renderTraits = (traits: Trait[]) => {
    return traits.map((trait, index) => (
      <li key={index}>
        {trait.trait}: {trait.score.toFixed(2)}
      </li>
    ));
  };

  // Split long text into readable paragraphs
  const sections = data.result
    .split("\n\n")
    .filter((section) => section.trim() !== '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-6 space-y-6"
    >
      {/* Overall Cultural-Fit Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Cultural Fit Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {sections.map((section, index) => (
            <p key={index} className="mb-4 text-gray-800">
              {section}
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Primary Traits */}
      {data.primary_traits && data.primary_traits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Traits</CardTitle>
          </CardHeader>
          <CardContent>
            {data.primary_traits.map((pt, idx) => (
              <div key={idx} className="mb-4">
                <p className="font-semibold text-gray-800 mb-1">
                  Segment: {pt.segment}
                </p>
                <ul className="list-disc list-inside ml-4">
                  {renderEmotions(pt.emotions)}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Secondary Traits */}
      {data.segment_secondary_traits &&
        data.segment_secondary_traits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Secondary Traits</CardTitle>
            </CardHeader>
            <CardContent>
              {data.segment_secondary_traits.map((st, idx) => (
                <div key={idx} className="mb-4">
                  <p className="font-semibold text-gray-800 mb-1">
                    Segment: {st.segment}
                  </p>
                  <ul className="list-disc list-inside ml-4">
                    {renderTraits(st.traits)}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </motion.div>
  );
};

export default CulturalFitAnalysis;