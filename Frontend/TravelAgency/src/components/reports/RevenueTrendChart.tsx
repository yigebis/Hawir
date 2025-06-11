
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, ArrowLeft } from "lucide-react";

interface RevenueData {
  period: string;
  revenue: number;
  fullDate?: string;
  monthIndex?: number; // For drill-down functionality
}

interface RevenueTrendChartProps {
  data: RevenueData[];
  period: 'daily' | 'monthly';
  year: string;
  selectedMonth?: string;
  onPeriodChange: (period: 'daily' | 'monthly') => void;
  onYearChange: (year: string) => void;
  onMonthSelect?: (month: string) => void;
  onBackToMonthly?: () => void;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  data,
  period,
  year,
  selectedMonth,
  onPeriodChange,
  onYearChange,
  onMonthSelect,
  onBackToMonthly
}) => {
  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const displayDate = data.fullDate || label;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-700">{displayDate}</p>
          <p className="text-[#F35B04] font-bold">
            Revenue: {formatTooltipValue(payload[0].value)}
          </p>
          {period === 'monthly' && (
            <p className="text-xs text-gray-500 mt-1">Click to view daily breakdown</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot component for clickable monthly data points
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (period === 'monthly' && onMonthSelect && payload.monthIndex !== undefined) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        onMonthSelect(months[payload.monthIndex]);
      }
    };

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#F35B04"
        stroke="#fff"
        strokeWidth={2}
        style={{ 
          cursor: period === 'monthly' ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (period === 'monthly') {
            e.currentTarget.style.r = '8';
            e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(243, 91, 4, 0.3))';
          }
        }}
        onMouseLeave={(e) => {
          if (period === 'monthly') {
            e.currentTarget.style.r = '6';
            e.currentTarget.style.filter = 'none';
          }
        }}
      />
    );
  };

  const years = ['2023', '2024', '2025'];

  const getChartTitle = () => {
    if (period === 'daily' && selectedMonth) {
      return `Daily Revenue Trend - ${selectedMonth} ${year}`;
    }
    return `${period.charAt(0).toUpperCase() + period.slice(1)} Revenue Trend - ${year}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-[#F35B04]" />
          <CardTitle className="text-lg font-semibold">
            {getChartTitle()}
          </CardTitle>
          {period === 'daily' && selectedMonth && onBackToMonthly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToMonthly}
              className="ml-4 hover:bg-[#F35B04] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Monthly
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select value={year} onValueChange={onYearChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((yr) => (
                <SelectItem key={yr} value={yr}>{yr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!(period === 'daily' && selectedMonth) && (
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(value) => value && onPeriodChange(value as 'daily' | 'monthly')}
            >
              <ToggleGroupItem
                value="daily"
                className="data-[state=on]:bg-[#F35B04] data-[state=on]:text-white"
              >
                Daily
              </ToggleGroupItem>
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-[#F35B04] data-[state=on]:text-white"
              >
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#666"
                fontSize={12}
                angle={period === 'daily' ? -45 : 0}
                textAnchor={period === 'daily' ? 'end' : 'middle'}
                height={period === 'daily' ? 60 : 30}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={formatYAxisValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#F35B04"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ 
                  r: 8, 
                  stroke: "#F35B04", 
                  strokeWidth: 2,
                  fill: "#F35B04",
                  filter: 'drop-shadow(0 2px 4px rgba(243, 91, 4, 0.3))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total Revenue ({period === 'daily' && selectedMonth ? `${selectedMonth} ${year}` : year}): {formatTooltipValue(data.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
          {period === 'monthly' && (
            <div className="text-xs text-gray-500 italic">
              💡 Click on any data point to view daily breakdown
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendChart;
