import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const IncidentTimeline = () => {
  const { orgIdentifier } = useParams();
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [organizationId, setOrganizationId] = useState(orgIdentifier || '5c80d1dc-8174-4d49-9d32-f708bb80e5d8'); // Default to TechCorp

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizations/public/${organizationId}/incidents/timeline?days=${selectedDays}`);
      setTimelineData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load incident timeline data');
      console.error('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, [organizationId, selectedDays]);

  const calculateTimelineWidth = (startTime, endTime, periodStart, periodEnd) => {
    const totalPeriod = new Date(periodEnd) - new Date(periodStart);
    const incidentStart = Math.max(new Date(startTime), new Date(periodStart));
    const incidentEnd = Math.min(new Date(endTime), new Date(periodEnd));
    const incidentDuration = incidentEnd - incidentStart;
    
    const startPercent = (incidentStart - new Date(periodStart)) / totalPeriod * 100;
    const widthPercent = (incidentDuration) / totalPeriod * 100;
    
    return { left: startPercent, width: Math.max(widthPercent, 0.5) }; // Minimum 0.5% width for visibility
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`;
    } else {
      return `${Math.round(hours / 24 * 10) / 10}d`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading incident timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">{error}</div>
            <button 
              onClick={fetchTimelineData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!timelineData) return null;

  const { organization, timeline_period, services, summary, impact_legend } = timelineData;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600 mt-1">Incident Timeline</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{summary.total_incidents}</div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{summary.critical_incidents}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{summary.ongoing_incidents}</div>
            <div className="text-sm text-gray-600">Ongoing</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{summary.average_resolution_hours.toFixed(1)}h</div>
            <div className="text-sm text-gray-600">Avg Resolution</div>
          </div>
        </div>

        {/* Impact Legend */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact Legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(impact_legend).map(([impact, config]) => (
              <div key={impact} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: config.color }}
                ></div>
                <span className="text-sm font-medium capitalize">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Incident Timeline</h3>
          
          <div className="space-y-6">
            {services.map((serviceData) => (
              <div key={serviceData.service.id} className="border-l-4 border-gray-200 pl-6">
                {/* Service Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{serviceData.service.name}</h4>
                    <p className="text-sm text-gray-600">{serviceData.service.description}</p>
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      serviceData.service.current_status === 'operational' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {serviceData.service.current_status}
                    </span>
                    <span className="ml-2 text-gray-500">
                      {serviceData.incident_count} incident{serviceData.incident_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Timeline Bar */}
                {serviceData.incidents.length > 0 ? (
                  <div className="relative mb-4">
                    {/* Timeline background */}
                    <div className="h-8 bg-gray-100 rounded-lg relative overflow-hidden">
                      {/* Incident blocks */}
                      {serviceData.incidents.map((incident) => {
                        const { left, width } = calculateTimelineWidth(
                          incident.start_time,
                          incident.end_time,
                          timeline_period.start_date,
                          timeline_period.end_date
                        );
                        
                        return (
                          <div
                            key={incident.id}
                            className="absolute h-full rounded cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: incident.color
                            }}
                            title={`${incident.title} (${incident.impact}) - ${formatDuration(incident.duration_hours)}`}
                          >
                            {width > 15 && (
                              <div className="text-white text-xs p-1 truncate">
                                {incident.title}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Time labels */}
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatDate(timeline_period.start_date)}</span>
                      <span>{formatDate(timeline_period.end_date)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-8 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-sm text-green-600 font-medium">No incidents in this period</span>
                  </div>
                )}

                {/* Incident Details */}
                {serviceData.incidents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {serviceData.incidents.map((incident) => (
                      <div key={incident.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: incident.color }}
                              ></div>
                              <h5 className="font-medium text-gray-900">{incident.title}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                incident.impact === 'critical' ? 'bg-red-100 text-red-800' :
                                incident.impact === 'high' ? 'bg-orange-100 text-orange-800' :
                                incident.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {incident.impact}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {incident.status}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {formatDate(incident.start_time)} - {formatDate(incident.end_time)} 
                              ({formatDuration(incident.duration_hours)})
                              {incident.is_ongoing && <span className="text-orange-600 font-medium"> • Ongoing</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentTimeline;
