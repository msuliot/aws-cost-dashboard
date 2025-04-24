import AWS from 'aws-sdk';
import { DateTime } from 'luxon';

// Configure AWS SDK
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION || 'us-west-2',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
  })
});

// Create Cost Explorer client with explicit region
const ce = new AWS.CostExplorer({ region: 'us-west-2' });

export interface CostData {
  totalCost: number;
  services: {
    name: string;
    cost: number;
    percentage: number;
    usageTypes: {
      name: string;
      cost: number;
    }[];
  }[];
  dailyCosts: {
    date: string;
    services: {
      name: string;
      cost: number;
    }[];
  }[];
}

export async function getCostData(startDate: string, endDate: string): Promise<any[]> {
  try {
    const response = await ce.getCostAndUsage({
      TimePeriod: {
        Start: startDate,
        End: endDate
      },
      Granularity: 'DAILY',
      Metrics: ['UnblendedCost'],
      GroupBy: [
        { Type: 'DIMENSION', Key: 'SERVICE' },
        { Type: 'DIMENSION', Key: 'USAGE_TYPE' }
      ]
    }).promise();

    const costs = [];
    if (response.ResultsByTime) {
      for (const result of response.ResultsByTime) {
        if (result.TimePeriod?.Start && result.Groups) {
          const date = result.TimePeriod.Start;
          for (const group of result.Groups) {
            if (group.Keys && group.Metrics?.UnblendedCost?.Amount) {
              const service = group.Keys[0] || 'Unknown';
              const usageType = group.Keys[1] || 'N/A';
              const cost = parseFloat(group.Metrics.UnblendedCost.Amount);
              if (cost > 0) {
                costs.push({
                  Date: date,
                  Service: service,
                  UsageType: usageType,
                  Cost: cost
                });
              }
            }
          }
        }
      }
    }
    return costs;
  } catch (error) {
    console.error('Error fetching cost data:', error);
    throw error;
  }
}

export function processCostData(costs: any[]): CostData {
  // Filter out very small costs
  const filteredCosts = costs.filter(cost => cost.Cost > 0.01);
  
  // Calculate total cost
  const totalCost = filteredCosts.reduce((sum, cost) => sum + cost.Cost, 0);
  
  // Group by service
  const serviceGroups: Record<string, { totalCost: number; usageTypes: Record<string, number> }> = {};
  filteredCosts.forEach(cost => {
    if (!serviceGroups[cost.Service]) {
      serviceGroups[cost.Service] = {
        totalCost: 0,
        usageTypes: {}
      };
    }
    serviceGroups[cost.Service].totalCost += cost.Cost;
    if (!serviceGroups[cost.Service].usageTypes[cost.UsageType]) {
      serviceGroups[cost.Service].usageTypes[cost.UsageType] = 0;
    }
    serviceGroups[cost.Service].usageTypes[cost.UsageType] += cost.Cost;
  });

  // Format the response
  const result: CostData = {
    totalCost,
    services: Object.entries(serviceGroups)
      .map(([name, data]) => ({
        name,
        cost: data.totalCost,
        percentage: (data.totalCost / totalCost) * 100,
        usageTypes: Object.entries(data.usageTypes)
          .map(([name, cost]) => ({
            name,
            cost
          }))
          .filter(ut => ut.cost > 0.01)
          .sort((a, b) => b.cost - a.cost)
      }))
      .sort((a, b) => b.cost - a.cost),
    dailyCosts: []
  };

  // Process daily costs
  const dailyGroups: Record<string, Record<string, number>> = {};
  filteredCosts.forEach(cost => {
    if (!dailyGroups[cost.Date]) {
      dailyGroups[cost.Date] = {};
    }
    if (!dailyGroups[cost.Date][cost.Service]) {
      dailyGroups[cost.Date][cost.Service] = 0;
    }
    dailyGroups[cost.Date][cost.Service] += cost.Cost;
  });

  result.dailyCosts = Object.entries(dailyGroups)
    .map(([date, services]) => ({
      date,
      services: Object.entries(services)
        .map(([name, cost]) => ({
          name,
          cost
        }))
        .filter(s => s.cost > 0.01)
        .sort((a, b) => b.cost - a.cost)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

export async function fetchCostData(): Promise<CostData> {
  const endDate = DateTime.now().toFormat('yyyy-MM-dd');
  const startDate = DateTime.now().minus({ days: 30 }).toFormat('yyyy-MM-dd');
  
  const costs = await getCostData(startDate, endDate);
  if (!costs.length) {
    throw new Error('No cost data found');
  }
  
  return processCostData(costs);
} 