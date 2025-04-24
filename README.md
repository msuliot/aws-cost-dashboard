# AWS Cost Dashboard

A modern, dark-themed dashboard for visualizing your AWS costs across different services. Built with React, TypeScript, and Material-UI.

![Dashboard Preview](dashboard-preview.png)

## Features

- 🌙 Modern dark theme interface
- 💰 Real-time AWS cost analysis
- 📊 Interactive pie chart showing top 5 services by cost
- 📑 Detailed breakdown of costs per service
- 🔍 Drill-down capability into usage types for each service
- 💫 Smooth animations and transitions
- 📱 Fully responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- AWS CLI (configured with appropriate credentials)

## AWS Credentials Setup

1. Configure your AWS CLI with credentials that have Cost Explorer access:
   ```bash
   aws configure
   ```
   - Enter your AWS Access Key ID
   - Enter your AWS Secret Access Key
   - Set default region (e.g., us-west-2)
   - Set output format (json recommended)

2. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_AWS_REGION=your_aws_region
   REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_id
   REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_access_key
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aws-cost-dashboard.git
   cd aws-cost-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard in your browser.

## Application Structure

```
src/
├── components/          # React components
│   └── Dashboard.tsx    # Main dashboard component
├── services/           
│   └── awsService.ts   # AWS Cost Explorer integration
├── App.tsx             # Root application component
└── index.tsx           # Application entry point
```

## How It Works

The dashboard provides a visual representation of your AWS costs with the following features:

1. **Total AWS Cost Card**
   - Displays the total cost across all services
   - Updates based on the selected time period (default: last 30 days)

2. **Cost by Service Visualization**
   - Interactive pie chart showing cost distribution
   - Displays top 5 services by cost
   - Groups smaller costs into "Others" category
   - Hover for detailed cost information

3. **Service Details**
   - Clickable service cards showing individual service costs
   - Percentage of total cost for each service
   - Modal view with detailed usage type breakdown
   - Animated transitions for better user experience

## AWS Cost Explorer Integration

The application uses the AWS Cost Explorer API to fetch cost data. It requires the following permissions:
- `ce:GetCostAndUsage`
- `ce:GetCostForecast`

Make sure your AWS credentials have access to these actions.

## Security Considerations

- Never commit your `.env` file containing AWS credentials
- Use appropriate IAM roles and permissions
- Consider using AWS Cognito or similar for user authentication
- Regularly rotate AWS access keys

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
