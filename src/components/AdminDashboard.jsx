import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  ChevronDown,
  BarChart2,
  PieChart,
  Activity,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { AdminAnalyticsService } from '../services/adminAnalyticsService';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const [subscriptionMetrics, userMetrics, usageMetrics] = await Promise.all([
          AdminAnalyticsService.getSubscriptionMetrics(dateRange),
          AdminAnalyticsService.getUserMetrics(),
          AdminAnalyticsService.getUsageMetrics(),
        ]);

        setMetrics({
          subscription: subscriptionMetrics,
          users: userMetrics,
          usage: usageMetrics,
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader className='h-8 w-8 text-indigo-600 animate-spin' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 text-red-700 rounded-lg flex items-center'>
        <AlertCircle className='h-5 w-5 mr-2' />
        {error}
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
        <div className='flex items-center space-x-4'>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className='rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'>
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
            <option value='365d'>Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
        <MetricCard
          title='Active Subscriptions'
          value={metrics.subscription.activeSubscriptions}
          icon={Users}
          trend={+5.4}
        />
        <MetricCard
          title='Total Revenue'
          value={`R${metrics.subscription.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={+12.3}
        />
        <MetricCard
          title='Churn Rate'
          value={`${metrics.subscription.churnRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={-2.1}
          trendDirection='down'
        />
        <MetricCard
          title='Total Usage Hours'
          value={metrics.usage.totalTranscriptionHours.toFixed(1)}
          icon={Clock}
          trend={+8.7}
        />
      </div>

      {/* Charts Row */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        {/* Usage Over Time */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>Usage Over Time</h2>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={metrics.usage.peakUsageHours}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='hour' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='usage' stroke='#4F46E5' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscriptions by Plan */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>Subscriptions by Plan</h2>
          <div className='space-y-4'>
            {metrics.subscription.subscriptionsByPlan.map(plan => (
              <div key={plan._id} className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='w-4 h-4 rounded-full bg-indigo-600 mr-3' />
                  <span className='text-sm font-medium text-gray-900'>
                    {plan._id.charAt(0).toUpperCase() + plan._id.slice(1)}
                  </span>
                </div>
                <div className='flex items-center space-x-4'>
                  <span className='text-sm text-gray-500'>{plan.count} users</span>
                  <span className='text-sm font-medium text-gray-900'>R{plan.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-medium text-gray-900'>Recent Transactions</h2>
        </div>
        <div className='divide-y divide-gray-200'>
          {metrics.subscription.recentTransactions.map(transaction => (
            <div key={transaction._id} className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-900'>{transaction.userDetails[0]?.name}</p>
                  <p className='text-sm text-gray-500'>{transaction.userDetails[0]?.email}</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>
                    R{transaction.billingHistory.amount.toLocaleString()}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {new Date(transaction.billingHistory.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon: Icon, trend, trendDirection = 'up' }) {
  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-500'>{title}</p>
          <p className='mt-1 text-3xl font-semibold text-gray-900'>{value}</p>
        </div>
        <Icon className='h-8 w-8 text-indigo-600' />
      </div>
      <div className='mt-4'>
        <div className={`flex items-center text-sm ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trendDirection === 'up' ? '↑' : '↓'} {Math.abs(trend)}%
          <span className='ml-2 text-gray-500'>vs. last period</span>
        </div>
      </div>
    </div>
  );
}
