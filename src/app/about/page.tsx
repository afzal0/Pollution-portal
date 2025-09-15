"use client"

import { useState } from 'react'
import { ArrowLeft, ExternalLink, Mail, Github, Info, Shield, Database, Satellite, Users, Code, BookOpen, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function About() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'authors', label: 'Authors', icon: Users },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'data', label: 'Data Sources', icon: Database },
    { id: 'future', label: 'Future Updates', icon: Calendar },
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
              <h1 className="text-xl font-semibold text-gray-900">AUS-HEALTHSCAPE</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/afzal0/Pollution-portal"
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About AUS-HEALTHSCAPE</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      AUS-HEALTHSCAPE is a comprehensive spatiotemporal repository designed to provide researchers, 
                      scientists, and environmental professionals with access to environmental and social determinant 
                      data across urban, rural, and remote Australia. This open-source project aims to democratize 
                      access to environmental health data and support research initiatives focused on understanding 
                      the complex relationships between environmental factors and public health outcomes.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      The platform integrates satellite-derived pollution data, climate information, and social 
                      determinants to create a unified repository for environmental health research across Australia.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Satellite className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">Satellite Data Integration</h3>
                      </div>
                      <p className="text-blue-800 text-sm">
                        Utilizes high-resolution satellite imagery and atmospheric data from multiple sources 
                        to provide comprehensive environmental monitoring across Australia.
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Geographic Coverage</h3>
                      </div>
                      <p className="text-green-800 text-sm">
                        Comprehensive coverage across urban, rural, and remote areas of Australia with 
                        multiple geographic aggregation levels (SA2, SA3, SA4).
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Interactive map visualization with multiple data layers and visualization modes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Advanced time series analysis and trend monitoring capabilities
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Statistical analysis and data comparison tools for research
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Multiple data aggregation levels (daily, weekly, monthly, quarterly, yearly, seasonal)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Custom area analysis with polygon drawing and shapefile upload
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        Export capabilities for further analysis and research
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === 'authors' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Team</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      AUS-HEALTHSCAPE is developed by a collaborative research team focused on environmental 
                      health and spatial epidemiology across Australia.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mohammad Afzal Khan</h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Lead Developer & Research Associate
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Github className="w-4 h-4 text-gray-500" />
                              <a 
                                href="https://github.com/afzal0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                @afzal0
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a 
                                href="mailto:fzlkhan0@gmail.com"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                fzlkhan0@gmail.com
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Oyelola Adegboye</h3>
                          <p className="text-gray-600 text-sm mb-1">
                            Associate Professor
                          </p>
                          <p className="text-gray-600 text-sm mb-3">
                            Menzies School of Health Research<br />
                            Charles Darwin University, NT, Australia
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Github className="w-4 h-4 text-gray-500" />
                              <a 
                                href="https://github.com/oyeadegboye"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                @oyeadegboye
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a 
                                href="mailto:oyelola.adegboye@menzies.edu.au"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                oyelola.adegboye@menzies.edu.au
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Research Focus</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Our team specializes in spatial epidemiology, environmental health, and the development 
                      of innovative data platforms for public health research. We focus on understanding the 
                      complex relationships between environmental factors and health outcomes across diverse 
                      Australian communities.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === 'research' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Publications</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      The datasets and methodologies used in AUS-HEALTHSCAPE have been applied in several 
                      research studies, contributing to the understanding of environmental health relationships 
                      in Australia.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Related Research Projects
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Salmonella Climate Risk Analysis</h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Bayesian spatial modeling of climate-driven Salmonella risk in New South Wales, 
                            Australia (1991–2022) using distributed lag non-linear models (DLNMs).
                          </p>
                          <div className="flex items-center gap-2">
                            <Github className="w-4 h-4 text-gray-500" />
                            <a 
                              href="https://github.com/afzal0/Salmonella-data-repo"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                            >
                              View Repository
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Influenza Spatial Analysis</h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Distributed lag non-linear models (DLNMs) for influenza analysis in New South Wales, 
                            examining the relationship between environmental factors and influenza incidence.
                          </p>
                          <div className="flex items-center gap-2">
                            <Github className="w-4 h-4 text-gray-500" />
                            <a 
                              href="https://github.com/afzal0/SB-DLNM-Influenza_NSW"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                            >
                              View Repository
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Current Research</h3>
                      <p className="text-green-800 text-sm leading-relaxed mb-3">
                        Our team is currently in the process of publishing a comprehensive paper that explains 
                        the relevance, methodologies, and processes behind AUS-HEALTHSCAPE. This publication 
                        will detail the technical implementation, data processing workflows, and research 
                        applications of the platform.
                      </p>
                      <p className="text-green-800 text-sm leading-relaxed">
                        The research demonstrates the platform's utility for environmental health research 
                        and its potential for supporting evidence-based policy development across Australia.
                      </p>
                    </div>
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
                        The environmental data is processed and aggregated at various geographic levels (SA2, SA3, SA4) 
                        to provide comprehensive coverage across Australia. Data includes multiple pollutants such as 
                        AER_AI, AER_LH, CO, HCHO, CLOUD, and O3_TCL, with regular updates and quality assurance protocols.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'future' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Future Updates & Roadmap</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      AUS-HEALTHSCAPE is continuously evolving to provide researchers with the most comprehensive 
                      and up-to-date environmental health data platform for Australia.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Planned Enhancements
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Near Real-Time Data Integration</h4>
                          <p className="text-gray-600 text-sm">
                            Integration of near real-time data from multiple sources to provide up-to-the-minute 
                            environmental monitoring capabilities.
                          </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Enhanced Climate Data</h4>
                          <p className="text-gray-600 text-sm">
                            Updates to historical temperature data and integration of near real-time climatic 
                            data from multiple meteorological sources.
                          </p>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Multi-Source Data Integration</h4>
                          <p className="text-gray-600 text-sm">
                            Expansion to include data from additional environmental monitoring networks, 
                            government agencies, and research institutions.
                          </p>
                        </div>

                        <div className="border-l-4 border-orange-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
                          <p className="text-gray-600 text-sm">
                            Implementation of machine learning algorithms for predictive modeling and 
                            automated anomaly detection in environmental data.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-3">Research Impact</h3>
                      <p className="text-green-800 text-sm leading-relaxed">
                        These future updates will significantly enhance the platform's research capabilities, 
                        enabling more sophisticated environmental health studies and supporting evidence-based 
                        policy development across Australia. The integration of real-time data will provide 
                        researchers with unprecedented access to current environmental conditions and trends.
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
                              Contact: Mohammad Afzal Khan - fzlkhan0@gmail.com
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
                        Lead Developer
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">Mohammad Afzal Khan</p>
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
                          <p className="text-sm font-medium text-gray-700">GitHub</p>
                          <a 
                            href="https://github.com/afzal0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            @afzal0
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Purpose</p>
                          <p className="text-gray-600 text-sm">
                            For technical issues, collaboration inquiries, or data removal requests
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Research Lead
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">Oyelola Adegboye</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Title</p>
                          <p className="text-gray-600 text-sm">Associate Professor</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Institution</p>
                          <p className="text-gray-600 text-sm">Menzies School of Health Research<br />Charles Darwin University, NT, Australia</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <a 
                            href="mailto:oyelola.adegboye@menzies.edu.au"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            oyelola.adegboye@menzies.edu.au
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">GitHub</p>
                          <a 
                            href="https://github.com/oyeadegboye"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            @oyeadegboye
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">Data Removal Requests</h3>
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      If you believe the publication of this data violates any rules or regulations, 
                      please contact Mohammad Afzal Khan immediately at fzlkhan0@gmail.com. We are committed 
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