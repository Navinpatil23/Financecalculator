import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { mortgageCalculator, personalLoanCalculator, compoundInterestCalculator, retirementCalculator, savingsGoalCalculator, incomeTaxCalculator, percentageCalculator, netWorthCalculator } from '@calculators/index';
import { Calculator as ICalculator, CalculatorResult } from '@types/calculator';
import CalculatorInput from '@components/Calculator/CalculatorInput';
import CalculatorResult from '@components/Calculator/CalculatorResult';
import { saveCalculation } from '@utils/storage';
import { Download, Share2, RotateCcw } from 'lucide-react';

const CalculatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const calculators: Record<string, ICalculator> = {
    'mortgage': mortgageCalculator,
    'personal-loan': personalLoanCalculator,
    'compound-interest': compoundInterestCalculator,
    'retirement-savings': retirementCalculator,
    'savings-goal': savingsGoalCalculator,
    'income-tax': incomeTaxCalculator,
    'percentage': percentageCalculator,
    'net-worth': netWorthCalculator,
  };

  const calculator = id ? calculators[id] : null;
  const [inputs, setInputs] = useState(
    calculator
      ? Object.fromEntries(calculator.inputs.map((input) => [input.id, input.value]))
      : {}
  );
  const [results, setResults] = useState<CalculatorResult[]>([]);

  if (!calculator) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">Calculator not found.</p>
      </div>
    );
  }

  const handleInputChange = (inputId: string, value: string | number) => {
    setInputs({ ...inputs, [inputId]: value });
  };

  const handleCalculate = () => {
    const calculatedResults = calculator.calculate(inputs);
    setResults(calculatedResults);
    saveCalculation(calculator.id, inputs);
  };

  const handleReset = () => {
    setInputs(
      Object.fromEntries(calculator.inputs.map((input) => [input.id, input.value]))
    );
    setResults([]);
  };

  const handleShare = () => {
    const text = `Check out the ${calculator.title} at Smart Finance Calculator!`;
    if (navigator.share) {
      navigator.share({
        title: calculator.title,
        text: text,
        url: window.location.href,
      });
    } else {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(url, '_blank');
    }
  };

  const handleExport = () => {
    const content = `${calculator.title}\n\nInputs:\n${calculator.inputs.map((input) => `${input.label}: ${inputs[input.id]}`).join('\n')}\n\nResults:\n${results.map((result) => `${result.label}: ${result.value}`).join('\n')}`;
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `${calculator.id}-calculation.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{calculator.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{calculator.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft">
              <h2 className="text-lg font-semibold mb-4">Calculator Inputs</h2>
              <div>
                {calculator.inputs.map((input) => (
                  <CalculatorInput
                    key={input.id}
                    input={{ ...input, value: inputs[input.id] || input.value }}
                    onChange={(value) => handleInputChange(input.id, value)}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Calculate
                </button>
                <button
                  onClick={handleReset}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-soft">
              <h2 className="text-lg font-semibold mb-4">Results</h2>

              {results.length > 0 ? (
                <>
                  <div className="mb-6">
                    {results.map((result, index) => (
                      <CalculatorResult key={index} result={result} />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download size={16} /> Export
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Fill in the inputs and click Calculate to see results.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
