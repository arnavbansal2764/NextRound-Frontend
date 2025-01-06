"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Emotion, Segment, SegmentSecondaryTrait, Trait } from '@/lib/redis/types';

interface CulturalFitAnalysisProps {
  result: string;
  primary_traits: Segment[];
  segment_secondary_traits: SegmentSecondaryTrait[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

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

  // Clean the text by removing * and replacing \n with <br/>
  const cleanText = (text: string) => {
    return text.replace(/\*/g, '').replace(/\n/g, '<br/>');
  };

  // Format the result text as HTML
  const formatResult = (text: string) => {
    const cleanedText = cleanText(text);
    const paragraphs = cleanedText.split('<br/><br/>').map((paragraph, index) => `<p key=${index}>${paragraph}</p>`);
    return paragraphs.join('');
  };

  // Prepare data for Pie Charts
  const preparePieData = (items: { name: string; value: number }[]) => {
    return items.map((item) => ({
      name: item.name,
      value: item.value,
    }));
  };

  const prepareEmotionPieData = (emotions: Emotion[]) => {
    return emotions.map((emotion) => ({
      name: emotion.emotion_name,
      value: emotion.emotion_score,
    }));
  };

  const prepareTraitPieData = (traits: Trait[]) => {
    return traits.map((trait) => ({
      name: trait.trait,
      value: trait.score,
    }));
  };

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
          <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatResult(data.result) }} />
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareEmotionPieData(pt.emotions)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {pt.emotions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareTraitPieData(st.traits)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {st.traits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </motion.div>
  );
};

export default CulturalFitAnalysis;