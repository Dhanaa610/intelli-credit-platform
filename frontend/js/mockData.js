// MOCK DATA FOR INTELLI-CREDIT PLATFORM
const mockData = {
    // Analysis results metrics
    financialMetrics: {
        revenue: { value: '₹12.4 Cr', label: 'Total Revenue', trend: '+15% yoy', status: 'positive' },
        profit: { value: '₹2.1 Cr', label: 'Net Profit', trend: '+8% yoy', status: 'positive' },
        debt: { value: '₹3.5 Cr', label: 'Total Debt', trend: '-2% yoy', status: 'neutral' },
        cashflow: { value: '₹1.8 Cr', label: 'Operating Cash Flow', trend: 'Stable', status: 'positive' }
    },

    // Extracted inconsistencies
    inconsistencies: [
        { type: 'warning', text: 'GST returns show ₹12.4 Cr revenue, but bank deposits total ₹11.2 Cr.' },
        { type: 'danger', text: 'Short-term liabilities exceed liquid assets by 15%.' }
    ],

    // Research findings
    researchFindings: [
        { 
            source: 'Ministry of Corporate Affairs',
            date: 'Oct 2025',
            impact: 'negative',
            title: 'Late filing of annual returns flagged by MCA',
            details: 'Company was penalized ₹50,000 for delayed filing in FY24.'
        },
        { 
            source: 'Industry Report',
            date: 'Jan 2026',
            impact: 'positive',
            title: 'Manufacturing sector expected to grow 8%',
            details: 'Favorable government policies boosting domestic manufacturing.'
        },
        { 
            source: 'Legal Database',
            date: 'Active',
            impact: 'warning',
            title: 'Ongoing dispute with raw material supplier',
            details: 'Pending case in High Court regarding clear title of industrial plot (#4582).'
        }
    ],

    // Credit Risk Framework (Five Cs)
    riskEvaluation: {
        score: 72,
        category: 'Moderate',
        character: { rating: 'Good', score: 80, comment: 'Promoters have 15 years experience, no willful defaults.' },
        capacity: { rating: 'Average', score: 65, comment: 'DSCR is slightly tight at 1.2x. Cash flow covers existing EMI.' },
        capital: { rating: 'Good', score: 75, comment: 'Promoter equity infusion of ₹1 Cr noted last year.' },
        collateral: { rating: 'Strong', score: 85, comment: 'Primary security cover is 1.5x (Industrial Property).' },
        conditions: { rating: 'Average', score: 55, comment: 'Industry facing supply chain headwinds globally.' }
    },

    // Final CAM generated text
    camReport: {
        decision: 'Approved with Conditions',
        recommendedAmount: '₹4.5 Crore',
        requestedAmount: '₹5.0 Crore',
        interestRate: '10.8% p.a.',
        summary: "The company demonstrates a stable operational history with consistent year-on-year revenue growth. While the debt coverage ratio is slightly constrained, the tangible collateral holding is strong. The application is recommended for approval subject to standard financial covenants and a reduced sanction limit to mitigate short-term liquidity risks."
    }
};

window.mockData = mockData;
