import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const FinancialCharts = ({ balance = {}, distribution = {} }) => {
  const financialData = [
    {
      name: "Income",
      amount: Number(balance.totalIncome || 0),
    },
    {
      name: "Expense",
      amount: Number(balance.totalExpense || 0),
    },
    {
      name: "Balance",
      amount: Number(balance.overallBalance || 0),
    },
  ];

  const distributionData = [
    {
      name: "Distributed",
      value: Number(distribution.cashDistributed || 0),
    },
    {
      name: "Returned",
      value: Number(distribution.cashReturned || 0),
    },
    {
      name: "With Volunteers",
      value: Number(distribution.cashWithVolunteers || 0),
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* INCOME VS EXPENSE */}

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Financial Overview
          </h2>

          <p className="text-sm text-gray-500">
            Income, expenses and overall balance
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString("en-IN")}`
                }
              />

              <Legend />

              <Bar
                dataKey="amount"
                name="Amount"
                fill="#111827"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CASH DISTRIBUTION */}

      <div className="rounded-xl border bg-white p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Cash Distribution
          </h2>

          <p className="text-sm text-gray-500">
            Distribution and volunteer cash status
          </p>
        </div>

        <div className="h-80">
          {distributionData.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {distributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No cash distribution data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;
