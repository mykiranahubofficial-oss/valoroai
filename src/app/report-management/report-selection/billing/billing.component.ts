// C:\Users\Prashant\Desktop\valorademo\src\app\billing\billing.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SubscriptionPlan {
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  features: string[];
  // ✅ FIX: Added 'available' to the union type
  status: 'active' | 'expired' | 'pending' | 'available';
  nextBillingDate?: string;
  popular?: boolean;
}

interface BillingHistory {
  invoiceId: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  
  agencyName = '';
  loading = false;

  currentPlan: SubscriptionPlan | null = null;
  availablePlans: SubscriptionPlan[] = [];
  billingHistory: BillingHistory[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.agencyName = localStorage.getItem('agencyName') || 'Agency';
    
    if (!localStorage.getItem('agencyToken')) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/']);
      return;
    }

    this.loadMockData();
  }

  loadMockData(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.currentPlan = {
        planId: 'pro-001',
        planName: 'Professional',
        billingCycle: 'monthly',
        price: 2999,
        features: [
          'Unlimited Report Generation',
          'Priority Email Support',
          'API Access (10K calls/mo)',
          'Custom Branding',
          'Team Collaboration (5 seats)'
        ],
        status: 'active',  // ✅ Current plan = active
        nextBillingDate: '2026-04-27'
      };

      this.availablePlans = [
        {
          planId: 'basic-001',
          planName: 'Basic',
          billingCycle: 'monthly',
          price: 999,
          features: [
            '5 Reports/Month',
            'Email Support',
            'Standard Templates',
            '1 User Seat'
          ],
          status: 'available'  // ✅ Now valid
        },
        {
          planId: 'pro-001',
          planName: 'Professional',
          billingCycle: 'monthly',
          price: 2999,
          features: [
            'Unlimited Reports',
            'Priority Support',
            'API Access',
            'Custom Branding',
            '5 User Seats'
          ],
          status: 'active',  // ✅ Current plan
          popular: true
        },
        {
          planId: 'enterprise-001',
          planName: 'Enterprise',
          billingCycle: 'monthly',
          price: 7999,
          features: [
            'Everything in Professional',
            'Dedicated Account Manager',
            'Unlimited API Calls',
            'SSO & Advanced Security',
            'Unlimited Seats',
            'Custom Integrations'
          ],
          status: 'available'  // ✅ Now valid
        }
      ];

      this.billingHistory = [
        {
          invoiceId: 'INV-2026-0327',
          date: '2026-03-27',
          amount: 2999,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        },
        {
          invoiceId: 'INV-2026-0227',
          date: '2026-02-27',
          amount: 2999,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        },
        {
          invoiceId: 'INV-2026-0127',
          date: '2026-01-27',
          amount: 2999,
          status: 'paid',
          description: 'Professional Plan - Monthly'
        }
      ];
      
      this.loading = false;
    }, 600);
  }

  onUpgrade(plan: SubscriptionPlan): void {
    if (plan.planId === this.currentPlan?.planId) return;
    console.log('Upgrade requested:', plan.planName);
    alert(`✓ Switched to ${plan.planName} plan!`);
  }

  onViewInvoice(invoice: BillingHistory): void {
    console.log('View invoice:', invoice.invoiceId);
    alert(`📄 Invoice ${invoice.invoiceId}\nAmount: ₹${invoice.amount}\nStatus: ${invoice.status}`);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  getCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  isCurrentPlan(planId: string): boolean {
    return this.currentPlan?.planId === planId;
  }
}