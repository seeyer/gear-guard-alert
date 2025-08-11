import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MaintenanceAlertRequest {
  equipmentId: string;
  alertType: 'maintenance_due' | 'overdue' | 'critical';
  recipients: string[];
  customMessage?: string;
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  location: string;
  next_maintenance: string;
  last_maintenance: string;
  hours_operated: number;
  status: string;
}

// Email rate limiter with exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const sendEmailWithRetry = async (
  emailData: any, 
  maxRetries = 3, 
  baseDelay = 1000
): Promise<{ success: boolean; data?: any; error?: string }> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await resend.emails.send(emailData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Email attempt ${attempt + 1} failed:`, error.message);
      
      // Check if it's a rate limit or threshold error
      const isRateLimit = error.message?.toLowerCase().includes('rate limit') || 
                         error.message?.toLowerCase().includes('threshold') ||
                         error.message?.toLowerCase().includes('quota') ||
                         error.status === 429;
      
      if (isRateLimit && attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Rate limit hit, waiting ${delayTime}ms before retry ${attempt + 1}...`);
        await delay(delayTime);
        continue;
      }
      
      // If it's the last attempt or not a rate limit error, return the error
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, error: "Max retries exceeded" };
};

const getEmailTemplate = (alertType: string, equipment: Equipment, customMessage?: string) => {
  const templates = {
    maintenance_due: {
      subject: `Maintenance Due - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Maintenance Due Notification</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
              <h3 style="color: #007bff; margin-top: 0;">Equipment Details</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Next Maintenance:</td>
                  <td style="padding: 8px 0; color: #007bff; font-weight: bold;">${equipment.next_maintenance}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Current Status:</td>
                  <td style="padding: 8px 0;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated notification from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    overdue: {
      subject: `🚨 OVERDUE Maintenance - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">⚠️ OVERDUE MAINTENANCE ALERT</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">Equipment Requires Immediate Attention</h3>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="color: #721c24; margin: 0; font-weight: bold;">
                  This equipment is overdue for maintenance and may pose safety or operational risks.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Due Date:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${equipment.next_maintenance} (OVERDUE)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Current Status:</td>
                  <td style="padding: 8px 0;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated urgent notification from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    },
    critical: {
      subject: `🔴 CRITICAL Alert - ${equipment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc3545; margin-bottom: 20px;">🔴 CRITICAL EQUIPMENT ALERT</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">IMMEDIATE ACTION REQUIRED</h3>
              
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="color: #721c24; margin: 0; font-weight: bold;">
                  🚨 CRITICAL STATUS: This equipment requires immediate inspection and maintenance.
                </p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Equipment Name:</td>
                  <td style="padding: 8px 0;">${equipment.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Model:</td>
                  <td style="padding: 8px 0;">${equipment.model}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Serial Number:</td>
                  <td style="padding: 8px 0;">${equipment.serial_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0;">${equipment.location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: #dc3545; font-weight: bold; text-transform: uppercase;">${equipment.status}</td>
                </tr>
              </table>
            </div>
            
            ${customMessage ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Additional Message:</h4>
                <p style="color: #856404; margin-bottom: 0;">${customMessage}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This is an automated critical alert from your Machinery Management System</p>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[alertType] || templates.maintenance_due;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { equipmentId, alertType, recipients, customMessage }: MaintenanceAlertRequest = await req.json();

    // Fetch equipment details
    const { data: equipment, error: equipmentError } = await supabaseClient
      .from('assets')
      .select('*')
      .eq('id', equipmentId)
      .single();

    if (equipmentError || !equipment) {
      throw new Error(`Equipment not found: ${equipmentError?.message}`);
    }

    const template = getEmailTemplate(alertType, equipment, customMessage);

    // Send emails with rate limiting and retry logic
    const emailResults = [];
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      console.log(`Sending email ${i + 1}/${recipients.length} to ${recipient}`);
      
      // Add delay between emails to avoid hitting rate limits
      if (i > 0) {
        await delay(500); // 500ms delay between emails
      }

      const emailResult = await sendEmailWithRetry({
        from: "Machinery Alerts <alerts@resend.dev>",
        to: [recipient],
        subject: template.subject,
        html: template.html,
      });

      // Log email attempt
      try {
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            asset_id: equipmentId,
            notification_type: alertType,
            recipient_email: recipient,
            email_status: emailResult.success ? 'sent' : 'failed',
            error_message: emailResult.error || null,
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
      } catch (logError) {
        console.error('Failed to log email attempt:', logError);
      }

      emailResults.push({
        recipient,
        success: emailResult.success,
        messageId: emailResult.data?.id,
        error: emailResult.error
      });

      console.log(`Email to ${recipient}: ${emailResult.success ? 'SUCCESS' : 'FAILED'} ${emailResult.error ? `(${emailResult.error})` : ''}`);
    }

    const successful = emailResults.filter(r => r.success).length;
    const failed = emailResults.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      message: `Sent ${successful} emails successfully, ${failed} failed`,
      results: emailResults,
      equipmentName: equipment.name,
      alertType
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-maintenance-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);