"use client"

import { useState } from 'react'
import { ArrowLeft, ExternalLink, Mail, Github, Info, Shield, Database, Satellite, Users, Code } from 'lucide-react'
import Link from 'next/link'

export default function About() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'data', label: 'Data Sources', icon: Database },
    { id: 'usage', label: 'Usage & License', icon: Shield },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'contribute', label: 'Contribute', icon: Code }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Portal
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Australia Pollution Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/afzalkhan0/pollution-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map(section => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About Australia Pollution Portal</h2>
                    <p className="text-gray-600 leading-relaxed">
                      The Australia Pollution Portal is a comprehensive data analysis platform designed to provide 
                      researchers, scientists, and environmental professionals with access to satellite-derived 
                      pollution data across Australia. This open-source project aims to democratize access to 
                      environmental data and support research initiatives focused on air quality monitoring and analysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Satellite className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">Satellite Data</h3>
                      </div>
                      <p className="text-blue-800 text-sm">
                        Utilizes high-resolution satellite imagery and atmospheric data to provide 
                        comprehensive pollution monitoring across Australia.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Research Focus</h3>
                      </div>
                      <p className="text-green-800 text-sm">
                        Designed specifically for academic and research purposes to support 
                        environmental studies and policy development.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Interactive map visualization with multiple data layers
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Time series analysis and trend monitoring
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Statistical analysis and data comparison tools
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Multiple data aggregation levels (daily, weekly, monthly, etc.)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Export capabilities for further analysis
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources & Acknowledgments</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">Data Attribution</h3>
                          <p className="text-blue-800 text-sm leading-relaxed mb-3">
                            Contains modified Copernicus Sentinel and CAMS data (2025), processed via Google Earth Engine. 
                            © European Union, Copernicus Programme.
                          </p>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            This application uses data from the Copernicus Programme (Sentinel satellites and Copernicus 
                            Atmosphere Monitoring Service – CAMS), accessed and processed via Google Earth Engine. 
                            The European Union's Copernicus Programme provides these datasets under its free and open data policy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Data Sources
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Google Earth Engine</h4>
                          <p className="text-gray-600 text-sm mb-2">
                            Primary data source providing access to satellite imagery and atmospheric data.
                          </p>
                          <a
                            href="https://earthengine.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Visit Google Earth Engine
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Copernicus Atmosphere Monitoring Service (CAMS)</h4>
                          <p className="text-gray-600 text-sm mb-2">
                            European Union's Earth observation program providing atmospheric composition data.
                          </p>
                          <a
                            href="https://atmosphere.copernicus.eu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Visit CAMS
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Australian Statistical Geography Standard (ASGS)</h4>
                          <p className="text-gray-600 text-sm">
                            Geographic boundaries and statistical areas used for data aggregation and visualization.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Data Processing</h3>
                      <p className="text-blue-800 text-sm leading-relaxed">
                        The pollution data is processed and aggregated at various geographic levels (SA2, SA3, SA4) 
                        to provide comprehensive coverage across Australia. Data is updated regularly and includes 
                        multiple pollutants such as AER_AI, AER_LH, CO, HCHO, CLOUD, and O3_TCL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'usage' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage & License</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-900 mb-2">Copernicus Open Data Policy</h3>
                          <p className="text-green-800 text-sm leading-relaxed mb-3">
                            This application uses data from the Copernicus Programme under its free and open data policy. 
                            You can download, use, modify, and redistribute the data for research, education, commercial, 
                            or non-commercial purposes without fees or royalties.
                          </p>
                          <div className="bg-white border border-green-200 rounded p-3">
                            <p className="text-green-700 text-sm font-medium">
                              Contact: Afzal Khan - fzlkhan0@gmail.com
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms of Use</h3>
                      <div className="space-y-4 text-sm text-gray-600">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Open Data Usage</h4>
                          <p>This platform uses Copernicus data under its free and open data policy. Data can be used for research, education, commercial, or non-commercial purposes.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Required Attribution</h4>
                          <p>Users must properly attribute data sources: "Contains modified Copernicus Sentinel and CAMS data (2025), processed via Google Earth Engine. © European Union, Copernicus Programme."</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Data Modification Notice</h4>
                          <p>Since the data has been processed and aggregated, users must indicate that the data were modified from the original Copernicus datasets.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">No Endorsement</h4>
                          <p>This application does not suggest endorsement by the European Union, ESA, ECMWF, or Google. All interpretations are solely those of the authors.</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Open Source Platform</h4>
                          <p>This project is open source and available under the MIT License. Feel free to contribute and improve the platform.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Open Source License</h3>
                      <p className="text-green-800 text-sm leading-relaxed">
                        This project is released under the MIT License, allowing free use, modification, and distribution. 
                        The source code is available on GitHub for transparency and community contributions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Developer Contact
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">Afzal Khan</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <a 
                            href="mailto:fzlkhan0@gmail.com"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            fzlkhan0@gmail.com
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Purpose</p>
                          <p className="text-gray-600 text-sm">
                            For data removal requests, technical issues, or collaboration inquiries
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Github className="w-5 h-5" />
                        Project Repository
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">GitHub Repository</p>
                          <a 
                            href="https://github.com/afzalkhan0/pollution-portal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            View on GitHub
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">License</p>
                          <p className="text-gray-600 text-sm">MIT License</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contributions</p>
                          <p className="text-gray-600 text-sm">
                            Pull requests and issues are welcome
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">Data Removal Requests</h3>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      If you believe the publication of this data violates any rules or regulations, 
                      please contact Afzal Khan immediately at fzlkhan0@gmail.com. We are committed 
                      to responsible data usage and will promptly address any concerns.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'contribute' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contribute to the Project</h2>
                    <p className="text-gray-600 leading-relaxed">
                      This is an open-source project and we welcome contributions from the community. 
                      Whether you're a developer, researcher, or data enthusiast, there are many ways to contribute.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Development
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <h4 className="font-medium text-gray-900">Bug Reports</h4>
                          <p>Report issues and bugs through GitHub Issues</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Feature Requests</h4>
                          <p>Suggest new features and improvements</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Code Contributions</h4>
                          <p>Submit pull requests for bug fixes and new features</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Documentation</h4>
                          <p>Help improve documentation and user guides</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Research
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <h4 className="font-medium text-gray-900">Data Validation</h4>
                          <p>Help validate data accuracy and quality</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Research Collaboration</h4>
                          <p>Collaborate on research projects using the data</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Use Cases</h4>
                          <p>Share interesting use cases and applications</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Publications</h4>
                          <p>Cite the platform in your research publications</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
                    <div className="space-y-3 text-blue-800 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <p>Fork the repository on GitHub</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <p>Create a feature branch for your changes</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <p>Follow the coding standards and add tests</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <p>Submit a pull request with a clear description</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Guidelines</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Be respectful and inclusive in all interactions</p>
                      <p>• Provide constructive feedback and suggestions</p>
                      <p>• Follow the project's code of conduct</p>
                      <p>• Help others learn and grow in the community</p>
                      <p>• Respect the research-focused nature of the project</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-500 text-center">
            Contains modified Copernicus Sentinel and CAMS data (2025), processed via Google Earth Engine. 
            © European Union, Copernicus Programme.
          </p>
        </div>
      </div>
    </div>
  )
}
