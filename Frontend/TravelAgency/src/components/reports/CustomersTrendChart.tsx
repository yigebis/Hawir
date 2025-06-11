
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, ArrowLeft } from "lucide-react";

interface CustomersData {
  period: string;
  customers: number;
  fullDate?: string;
  monthIndex?: number;
}

interface CustomersTrendChartProps {
  data: CustomersData[];
  period: 'daily' | 'monthly';
  year: string;
  selectedMonth?: string;
  onPeriodChange: (period: 'daily' | 'monthly') => void;
  onYearChange: (year: string) => void;
  onMonthSelect?: (month: string) => void;
  onBackToMonthly?: () => void;
}

const CustomersTrendChart: React.FC<CustomersTrendChartProps> = ({
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
    return `${value.toLocaleString()} customers`;
  };

  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const displayDate = data.fullDate || label;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-700">{displayDate}</p>
          <p className="text-blue-600 font-bold">
            New Customers: {formatTooltipValue(payload[0].value)}
          </p>
          {period === 'monthly' && (
            <p className="text-xs text-gray-500 mt-1">Click to view daily breakdown</p>
          )}
        </div>
      );
    }
    return null;
  };

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
        fill="#3B82F6"
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
            e.currentTarget.style.filter = 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))';
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
      return `Daily New Customers - ${selectedMonth} ${year}`;
    }
    return `${period.charAt(0).toUpperCase() + period.slice(1)} New Customers - ${year}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold">
            {getChartTitle()}
          </CardTitle>
          {period === 'daily' && selectedMonth && onBackToMonthly && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBackToMonthly}
              className="ml-4 hover:bg-blue-600 hover:text-white transition-colors"
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
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
              >
                Daily
              </ToggleGroupItem>
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
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
                dataKey="customers"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ 
                  r: 8, 
                  stroke: "#3B82F6", 
                  strokeWidth: 2,
                  fill: "#3B82F6",
                  filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total New Customers ({period === 'daily' && selectedMonth ? `${selectedMonth} ${year}` : year}): {data.reduce((sum, item) => sum + item.customers, 0).toLocaleString()}
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

export default CustomersTrendChart;
