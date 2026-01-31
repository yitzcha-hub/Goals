import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Target, TrendingUp, Lightbulb, CheckCircle2, Clock } from 'lucide-react';
import { AIMilestoneAnalysis } from '../lib/aiMilestoneSuggestions';

interface AIMilestoneSuggestionsProps {
  analysis: AIMilestoneAnalysis;
  onAcceptMilestone?: (milestoneId: string) => void;
}

export function AIMilestoneSuggestions({ analysis, onAcceptMilestone }: AIMilestoneSuggestionsProps) {
  const { milestones, nextSteps, prediction, insights } = analysis;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'accelerating': return 'text-green-600';
      case 'slowing': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'accelerating' ? '📈' : trend === 'slowing' ? '📉' : '➡️';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Insights</h3>
            <p className="text-sm text-gray-600">Powered by progress analysis</p>
          </div>
        </div>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <span className="text-sm">{insight}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Completion Prediction */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Completion Prediction</h3>
            <p className="text-sm text-gray-600">Based on your current progress rate</p>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            {prediction.confidence}% confidence
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {prediction.daysRemaining}
            </div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {prediction.progressRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Progress/Day</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getTrendColor(prediction.trend)}`}>
              {getTrendIcon(prediction.trend)}
            </div>
            <div className="text-sm text-gray-600 capitalize">{prediction.trend}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold text-gray-700">
              {prediction.predictedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-sm text-gray-600">Target Date</div>
          </div>
        </div>
      </Card>

      {/* Suggested Milestones */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-green-600 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Suggested Milestones</h3>
            <p className="text-sm text-gray-600">AI-recommended checkpoints for optimal progress</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="p-4 border rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <Badge className={getPriorityColor(milestone.priority)}>
                      {milestone.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {milestone.targetProgress}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {milestone.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                {onAcceptMilestone && (
                  <Button
                    size="sm"
                    onClick={() => onAcceptMilestone(milestone.id)}
                    className="ml-4"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                )}
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                <span className="font-medium">AI Reasoning: </span>
                {milestone.reasoning}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-orange-600 rounded-lg">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Recommended Next Steps</h3>
            <p className="text-sm text-gray-600">Actions to maintain or accelerate progress</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div key={step.id} className="p-4 border-l-4 border-orange-400 bg-orange-50 rounded-r-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{step.action}</h4>
                  <p className="text-sm text-gray-600 mb-2">{step.impact}</p>
                  <Badge variant="outline" className="bg-white">
                    {step.timeframe}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
