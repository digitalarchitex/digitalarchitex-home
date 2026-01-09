import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callCloudRun } from '@/lib/gcp-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user is admin via Cloud Run Auth API
    const authApiUrl = process.env.AUTH_API_URL || 'https://darx-auth-api-474964350921.us-central1.run.app';

    let isAdmin = false;
    try {
      const response = await callCloudRun(`${authApiUrl}/api/auth/check-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        isAdmin = data.is_admin || false;
      } else {
        console.error('Auth API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error calling auth API:', error);
      // Continue with isAdmin = false if auth API fails
    }

    if (isAdmin) {
      // Admin gets access to the onboarding portal on darx-site-generator
      // Call the site generator's check-onboarding-status to get admin token
      const siteGeneratorUrl = process.env.SITE_GENERATOR_URL || 'https://darx-site-generator-474964350921.us-central1.run.app';

      try {
        const response = await fetch(`${siteGeneratorUrl}/onboard/check-onboarding-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: normalizedEmail })
        });

        const data = await response.json();

        if (response.ok && data.redirect_url) {
          // Return the full URL with the token
          return NextResponse.json({
            is_admin: true,
            redirect_url: `${siteGeneratorUrl}${data.redirect_url}`
          });
        }
      } catch (error) {
        console.error('Error calling site generator:', error);
      }

      // Fallback to login page if token generation fails
      return NextResponse.json({
        is_admin: true,
        redirect_url: `${siteGeneratorUrl}/onboard/login`
      });
    }

    // Not admin - check if client exists
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, client_slug, contact_email, onboarding_complete')
      .eq('contact_email', normalizedEmail);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        is_admin: false,
        client_found: false,
        error: 'No account found with this email. Please sign up first.'
      }, { status: 404 });
    }

    const client = clients[0];
    const onboardingComplete = client.onboarding_complete || false;

    if (onboardingComplete) {
      // Already onboarded - redirect to dashboard
      return NextResponse.json({
        is_admin: false,
        client_found: true,
        onboarding_complete: true,
        client_id: client.id,
        redirect_url: `/dashboard?client_id=${client.id}`
      });
    }

    // Not onboarded - redirect to onboarding form
    // In production, you'd generate a secure token here
    return NextResponse.json({
      is_admin: false,
      client_found: true,
      onboarding_complete: false,
      client_id: client.id,
      client_slug: client.client_slug,
      redirect_url: `/onboard?client_id=${client.id}`
    });

  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
