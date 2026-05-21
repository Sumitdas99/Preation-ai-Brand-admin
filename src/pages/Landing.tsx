import {useState} from 'react';
import {
  Shield,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Upload,
  Scan,
  Brain,
  FileText,
  Eye,
  Package,
  FolderOpen,
  Bell,
  Users,
  Lock,
  Database,
  FileBarChart,
  ArrowRight,
  Zap,
  Globe,
  Code,
  Webhook,
  Cloud,
  Building2,
  Scale,
  ClipboardCheck,
  UserCheck,
  Mail,
  UserPlus,
  CheckCircle,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {useNavigate} from 'react-router-dom';
import {BrandAdminRegistrationDialog} from '@/components/BrandAdminRegistrationDialog';

export default function Landing() {
  const navigate = useNavigate();
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] =
    useState(false);

  const handleRequestDemo = () => {
    // Navigate to login or contact form
    navigate('/login');
  };

  const handleViewOverview = () => {
    // Scroll to features section or navigate
    document.getElementById('features')?.scrollIntoView({behavior: 'smooth'});
  };

  const handleRequestBrandAdminAccess = () => {
    setIsRegistrationDialogOpen(true);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Navigation */}
      <nav className='border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='h-8 w-8 text-primary' />
              <span className='text-xl font-display font-bold'>
                Praetion AI
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={handleViewOverview}>
                Features
              </Button>
              <Button variant='ghost' onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative py-20 sm:py-24 lg:py-32 overflow-hidden'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <Badge className='mb-6 bg-primary/10 text-primary border-primary/20'>
              EU AI Act Article 50 Compliant
            </Badge>
            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight'>
              Enterprise-Grade AI Compliance for Synthetic Media
            </h1>
            <p className='text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed'>
              Automatically detect AI-generated content, generate Article 50
              disclosures, verify consent, and maintain immutable audit trails.
              Stay compliant with EU AI Act and brand safety regulations.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='bg-gradient-primary text-lg px-8 py-6'
                onClick={handleRequestBrandAdminAccess}
              >
                Request Brand Admin Access
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='text-lg px-8 py-6'
                onClick={handleViewOverview}
              >
                View Platform Overview
              </Button>
            </div>
            <p className='text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2'>
              <Shield className='h-4 w-4' />
              Brand Admin access is subject to Super Admin approval
            </p>
          </div>
        </div>
      </section>

      {/* How Brand Admin Access Works Section */}
      <section className='py-16 sm:py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                How Brand Admin Access Works
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Secure, approval-based access for enterprise compliance
              </p>
            </div>
            <div className='relative'>
              {/* Connection Lines - Hidden on mobile */}
              <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2' />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative'>
                {[
                  {
                    step: 1,
                    icon: UserPlus,
                    title: 'Submit Registration Request',
                    description:
                      'Brand Admin completes registration form with profile details, password, and mandatory consent acknowledgements.',
                  },
                  {
                    step: 2,
                    icon: CheckCircle,
                    title: 'Mandatory Consent & Compliance',
                    description:
                      'Accept Terms of Service, Privacy Policy, and AI compliance consent requirements during registration.',
                  },
                  {
                    step: 3,
                    icon: Shield,
                    title: 'Super Admin Reviews & Approves',
                    description:
                      'Super Admin reviews the registration request and approves access based on compliance and security criteria.',
                  },
                  {
                    step: 4,
                    icon: Mail,
                    title: 'Approval Email → Secure Login',
                    description:
                      'Upon approval, Brand Admin receives confirmation email and can log in using the credentials created during registration.',
                  },
                ].map((workflow, idx) => (
                  <Card
                    key={idx}
                    className='relative bg-card border-2 hover:border-primary/50 transition-colors'
                  >
                    <CardHeader className='text-center'>
                      <div className='flex justify-center mb-4'>
                        <div className='relative'>
                          <div className='p-4 rounded-full bg-primary/10 border-2 border-primary/20'>
                            <workflow.icon className='h-8 w-8 text-primary' />
                          </div>
                          <div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                            {workflow.step}
                          </div>
                        </div>
                      </div>
                      <CardTitle className='text-lg'>
                        {workflow.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground text-center'>
                        {workflow.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className='mt-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                This registration is for Brand Admins only. Other roles
                (Legal/Approver, Brand Manager, Content Reviewer) are invited by
                the Brand Admin after workspace setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className='py-16 sm:py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                The Compliance Challenge
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Enterprises face critical risks without proper AI content
                governance
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {[
                {
                  icon: AlertTriangle,
                  title: 'No Visibility into AI-Generated Content',
                  description:
                    "Can't distinguish between human and AI-created media, exposing brands to compliance risks.",
                },
                {
                  icon: Scale,
                  title: 'Risk of Regulatory Fines',
                  description:
                    'EU AI Act violations can result in fines up to 7% of global annual turnover.',
                },
                {
                  icon: FileText,
                  title: 'Manual Disclosure & Approval Workflows',
                  description:
                    "Time-consuming, error-prone processes that don't scale with content volume.",
                },
                {
                  icon: Database,
                  title: 'No Audit-Ready Evidence',
                  description:
                    'Missing immutable records needed for compliance audits and legal defense.',
                },
              ].map((problem, idx) => (
                <Card key={idx} className='border-l-4 border-l-destructive'>
                  <CardHeader>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-destructive/10'>
                        <problem.icon className='h-6 w-6 text-destructive' />
                      </div>
                      <CardTitle className='text-xl'>{problem.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground'>
                      {problem.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className='py-16 sm:py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                How Praetion AI Solves This
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Comprehensive compliance automation for synthetic media
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[
                {
                  icon: Brain,
                  title: 'Multi-Modal AI Detection',
                  description:
                    'Detect synthetic content across images, videos, audio, and text with state-of-the-art models.',
                },
                {
                  icon: FileCheck,
                  title: 'Article 50 Disclosure Auto-Generation',
                  description:
                    'Automatically generate compliant disclosures required by EU AI Act Article 50.',
                },
                {
                  icon: Shield,
                  title: 'Brand Suitability & Policy Checks',
                  description:
                    'Verify content against brand policies and suitability guidelines before publication.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Consent Verification',
                  description:
                    'Track and verify user consent for AI-generated content with immutable records.',
                },
                {
                  icon: Lock,
                  title: 'Immutable Audit Logs',
                  description:
                    'Create tamper-proof audit trails that meet SOC 2 and compliance requirements.',
                },
                {
                  icon: Zap,
                  title: 'Real-Time Processing',
                  description:
                    'Scan and analyze content in real-time with enterprise-grade performance.',
                },
              ].map((solution, idx) => (
                <Card key={idx} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='p-2 rounded-lg bg-primary/10'>
                        <solution.icon className='h-6 w-6 text-primary' />
                      </div>
                      <CardTitle className='text-lg'>
                        {solution.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      {solution.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Workflow Section */}
      <section className='py-16 sm:py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                Platform Workflow
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                From upload to compliance-ready evidence pack
              </p>
            </div>
            <div className='relative'>
              {/* Connection Lines - Hidden on mobile */}
              <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2' />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative'>
                {[
                  {
                    step: 1,
                    icon: Upload,
                    title: 'Upload Asset',
                    description:
                      'Upload images, videos, audio, or text files via API, web interface, or watch folders.',
                  },
                  {
                    step: 2,
                    icon: Scan,
                    title: 'Pre-Flight Scan',
                    description:
                      'Initial metadata extraction and format validation before deep analysis.',
                  },
                  {
                    step: 3,
                    icon: Brain,
                    title: 'AI Detection',
                    description:
                      'Multi-modal AI models analyze content to detect synthetic media signatures.',
                  },
                  {
                    step: 4,
                    icon: FileText,
                    title: 'Disclosure & Fix',
                    description:
                      'Auto-generate Article 50 disclosures and flag policy violations for remediation.',
                  },
                  {
                    step: 5,
                    icon: Eye,
                    title: 'Review & Approval',
                    description:
                      'Role-based review workflow with legal approver oversight and consent tracking.',
                  },
                  {
                    step: 6,
                    icon: Package,
                    title: 'Evidence Pack & Audit Trail',
                    description:
                      'Generate immutable evidence packs with complete audit trail for compliance.',
                  },
                ].map((workflow, idx) => (
                  <Card
                    key={idx}
                    className='relative bg-card border-2 hover:border-primary/50 transition-colors'
                  >
                    <CardHeader className='text-center'>
                      <div className='flex justify-center mb-4'>
                        <div className='relative'>
                          <div className='p-4 rounded-full bg-primary/10 border-2 border-primary/20'>
                            <workflow.icon className='h-8 w-8 text-primary' />
                          </div>
                          <div className='absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                            {workflow.step}
                          </div>
                        </div>
                      </div>
                      <CardTitle className='text-lg'>
                        {workflow.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-muted-foreground text-center'>
                        {workflow.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id='features' className='py-16 sm:py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                Key Features
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Everything you need for enterprise AI compliance
              </p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[
                {
                  icon: Brain,
                  title: 'Synthetic Media Detection',
                  description: 'Multi-modal detection across all content types',
                },
                {
                  icon: FileBarChart,
                  title: 'C2PA / Content Provenance',
                  description: 'Verify content authenticity and origin',
                },
                {
                  icon: ClipboardCheck,
                  title: 'Article 50 Disclosure Templates',
                  description: 'Pre-built templates for EU AI Act compliance',
                },
                {
                  icon: Shield,
                  title: 'Brand Suitability Checks',
                  description: 'Automated policy enforcement and brand safety',
                },
                {
                  icon: Bell,
                  title: 'Slack / Teams Notifications',
                  description: 'Real-time alerts and workflow notifications',
                },
                {
                  icon: FolderOpen,
                  title: 'Watch Folders',
                  description: 'S3, Google Drive, SharePoint integration',
                },
                {
                  icon: Users,
                  title: 'Role-Based Access Control',
                  description: 'Granular permissions and workflow controls',
                },
                {
                  icon: Package,
                  title: 'Evidence Pack Generation',
                  description: 'Immutable audit-ready compliance packages',
                },
              ].map((feature, idx) => (
                <Card key={idx} className='hover:shadow-md transition-shadow'>
                  <CardHeader>
                    <div className='p-3 rounded-lg bg-primary/10 w-fit mb-3'>
                      <feature.icon className='h-6 w-6 text-primary' />
                    </div>
                    <CardTitle className='text-base'>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className='py-16 sm:py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                Role-Based Access Control
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Designed for enterprise teams with clear role separation
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {[
                {
                  icon: Building2,
                  title: 'Brand Admin',
                  description:
                    'Full workspace management, policy configuration, and team oversight. Configure compliance rules and manage integrations.',
                },
                {
                  icon: Scale,
                  title: 'Legal / Approver',
                  description:
                    'Review and approve content disclosures, verify compliance, and sign off on evidence packs. Final approval authority.',
                },
                {
                  icon: UserCheck,
                  title: 'Brand Manager',
                  description:
                    'Monitor content pipeline, review violations, and manage brand suitability checks. Oversee content workflows.',
                },
                {
                  icon: Eye,
                  title: 'Content Reviewer',
                  description:
                    'Review flagged content, apply fixes, and prepare assets for approval. First-line content quality control.',
                },
              ].map((role, idx) => (
                <Card key={idx} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='p-2 rounded-lg bg-primary/10'>
                        <role.icon className='h-6 w-6 text-primary' />
                      </div>
                      <CardTitle className='text-lg'>{role.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground'>
                      {role.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className='py-16 sm:py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                Integrations
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Connect with your existing tools and workflows
              </p>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8'>
              {[
                {name: 'Google Drive', icon: Cloud},
                {name: 'AWS S3', icon: Cloud},
                {name: 'SharePoint', icon: Cloud},
                {name: 'Slack', icon: Bell},
                {name: 'Microsoft Teams', icon: Users},
              ].map((integration, idx) => (
                <Card
                  key={idx}
                  className='flex flex-col items-center justify-center p-6 hover:shadow-md transition-shadow'
                >
                  <integration.icon className='h-12 w-12 text-muted-foreground mb-3' />
                  <p className='text-sm font-medium text-center'>
                    {integration.name}
                  </p>
                </Card>
              ))}
            </div>
            <div className='text-center'>
              <p className='text-muted-foreground mb-4'>
                Plus webhook & API support for custom integrations
              </p>
              <div className='flex items-center justify-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Webhook className='h-4 w-4' />
                  <span>Webhooks</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Code className='h-4 w-4' />
                  <span>REST API</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Globe className='h-4 w-4' />
                  <span>OAuth 2.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className='py-16 sm:py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl sm:text-4xl font-display font-bold mb-4'>
                Security & Compliance
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                Enterprise-grade security built for compliance teams
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {[
                {
                  icon: Shield,
                  title: 'SOC-Ready Architecture',
                  description:
                    'Designed to meet SOC 2 Type II requirements with comprehensive security controls and monitoring.',
                },
                {
                  icon: Lock,
                  title: 'Encrypted Storage',
                  description:
                    'End-to-end encryption for all content and metadata at rest and in transit.',
                },
                {
                  icon: Database,
                  title: 'Immutable Audit Logs',
                  description:
                    'Tamper-proof audit trails with cryptographic signatures and timestamp verification.',
                },
                {
                  icon: CheckCircle2,
                  title: 'Compliance-First Design',
                  description:
                    'Built from the ground up to meet EU AI Act, GDPR, and other regulatory requirements.',
                },
              ].map((item, idx) => (
                <Card key={idx} className='border-l-4 border-l-primary'>
                  <CardHeader>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-primary/10'>
                        <item.icon className='h-6 w-6 text-primary' />
                      </div>
                      <CardTitle className='text-xl'>{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-muted-foreground'>{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 sm:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='max-w-4xl mx-auto text-center'>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6'>
              Get Audit-Ready for the EU AI Act
            </h2>
            <p className='text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Join leading enterprises using Praetion AI to automate compliance,
              reduce risk, and maintain brand safety.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='bg-gradient-primary text-lg px-8 py-6'
                onClick={handleRequestBrandAdminAccess}
              >
                Request Brand Admin Access
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='text-lg px-8 py-6'
                onClick={handleRequestDemo}
              >
                Book a Demo
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </div>
            <p className='text-sm text-muted-foreground mt-4'>
              Brand Admin access requires Super Admin approval
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t bg-card py-12'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
            <div>
              <div className='flex items-center gap-2 mb-4'>
                <Shield className='h-6 w-6 text-primary' />
                <span className='text-lg font-display font-bold'>
                  Praetion AI
                </span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Enterprise AI Compliance & Synthetic Media Detection Platform
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#features'
                    className='hover:text-foreground transition-colors'
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Legal</h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Compliance
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='hover:text-foreground transition-colors'
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Brand Admin Registration Dialog */}
      <BrandAdminRegistrationDialog
        open={isRegistrationDialogOpen}
        onOpenChange={setIsRegistrationDialogOpen}
      />
    </div>
  );
}
