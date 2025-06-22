import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Filter, X, RefreshCw } from 'lucide-react';
import { apiRequest } from '../api.js';

const QuestionFilterPanel = ({ onFiltersChange, onReset }) => {
    const [filterOptions, setFilterOptions] = useState({
        difficulties: [],
        algorithms: [],
        dataStructures: [],
        companies: []
    });
    const [selectedFilters, setSelectedFilters] = useState({
        difficulty: '',
        algorithms: [],
        dataStructures: [],
        companies: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        try {
            setIsLoading(true);
            const data = await apiRequest('/code/filter-options', 'GET');
            setFilterOptions(data);
        } catch (error) {
            console.error('Failed to load filter options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        let newFilters = { ...selectedFilters };
        
        if (filterType === 'difficulty') {
            newFilters.difficulty = value;
        } else if (Array.isArray(selectedFilters[filterType])) {
            // Handle multi-select filters
            if (value && !newFilters[filterType].includes(value)) {
                newFilters[filterType] = [...newFilters[filterType], value];
            }
        }
        
        setSelectedFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const removeFilter = (filterType, value) => {
        const newFilters = { ...selectedFilters };
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        setSelectedFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            difficulty: '',
            algorithms: [],
            dataStructures: [],
            companies: []
        };
        setSelectedFilters(emptyFilters);
        onFiltersChange(emptyFilters);
        if (onReset) onReset();
    };

    const FilterChip = ({ label, onRemove }) => (
        <div className="inline-flex items-center bg-indigo-600 text-white px-3 py-1 rounded-full text-sm mr-2 mb-2">
            <span>{label}</span>
            <button
                onClick={onRemove}
                className="ml-2 hover:bg-indigo-700 rounded-full p-1"
            >
                <X size={12} />
            </button>
        </div>
    );

    if (isLoading) {
        return (
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                        <Filter size={18} className="mr-2" />
                        筛选条件
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-4">
                        <RefreshCw size={20} className="animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-400">加载中...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <Filter size={18} className="mr-2" />
                        筛选条件
                    </div>
                    <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                    >
                        清除全部
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Difficulty Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        难度等级
                    </label>
                    <Select
                        value={selectedFilters.difficulty}
                        onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                        className="w-full"
                    >
                        <option value="">所有难度</option>
                        {filterOptions.difficulties.map(difficulty => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Company Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        公司
                    </label>
                    <Select
                        value=""
                        onChange={(e) => handleFilterChange('companies', e.target.value)}
                        className="w-full"
                    >
                        <option value="">选择公司</option>
                        {filterOptions.companies.map(company => (
                            <option key={company} value={company}>
                                {company}
                            </option>
                        ))}
                    </Select>
                    <div className="mt-2">
                        {selectedFilters.companies.map(company => (
                            <FilterChip
                                key={company}
                                label={company}
                                onRemove={() => removeFilter('companies', company)}
                            />
                        ))}
                    </div>
                </div>

                {/* Algorithm Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        算法
                    </label>
                    <Select
                        value=""
                        onChange={(e) => handleFilterChange('algorithms', e.target.value)}
                        className="w-full"
                    >
                        <option value="">选择算法</option>
                        {filterOptions.algorithms.map(algorithm => (
                            <option key={algorithm} value={algorithm}>
                                {algorithm}
                            </option>
                        ))}
                    </Select>
                    <div className="mt-2">
                        {selectedFilters.algorithms.map(algorithm => (
                            <FilterChip
                                key={algorithm}
                                label={algorithm}
                                onRemove={() => removeFilter('algorithms', algorithm)}
                            />
                        ))}
                    </div>
                </div>

                {/* Data Structure Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        数据结构
                    </label>
                    <Select
                        value=""
                        onChange={(e) => handleFilterChange('dataStructures', e.target.value)}
                        className="w-full"
                    >
                        <option value="">选择数据结构</option>
                        {filterOptions.dataStructures.map(ds => (
                            <option key={ds} value={ds}>
                                {ds}
                            </option>
                        ))}
                    </Select>
                    <div className="mt-2">
                        {selectedFilters.dataStructures.map(ds => (
                            <FilterChip
                                key={ds}
                                label={ds}
                                onRemove={() => removeFilter('dataStructures', ds)}
                            />
                        ))}
                    </div>
                </div>

                {/* Active Filters Summary */}
                {Object.values(selectedFilters).some(filter => 
                    filter && (Array.isArray(filter) ? filter.length > 0 : true)
                ) && (
                    <div className="pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">当前筛选条件:</h4>
                        <div className="space-y-2">
                            {selectedFilters.difficulty && (
                                <div className="text-xs text-gray-400">
                                    难度: <span className="text-indigo-400">{selectedFilters.difficulty}</span>
                                </div>
                            )}
                            {selectedFilters.companies.length > 0 && (
                                <div className="text-xs text-gray-400">
                                    公司: <span className="text-indigo-400">{selectedFilters.companies.join(', ')}</span>
                                </div>
                            )}
                            {selectedFilters.algorithms.length > 0 && (
                                <div className="text-xs text-gray-400">
                                    算法: <span className="text-indigo-400">{selectedFilters.algorithms.join(', ')}</span>
                                </div>
                            )}
                            {selectedFilters.dataStructures.length > 0 && (
                                <div className="text-xs text-gray-400">
                                    数据结构: <span className="text-indigo-400">{selectedFilters.dataStructures.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default QuestionFilterPanel; 