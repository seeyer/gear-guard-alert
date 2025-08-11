import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkAlertRequest {
  daysBeforeDue?: number;
  criticalOnly?: boolean;
  recipients: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { daysBeforeDue = 7, criticalOnly = false, recipients }: BulkAlertRequest = await req.json();

    // Calculate due date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysBeforeDue);

    let query = supabaseClient
      .from('assets')
      .select('*')
      .lte('next_maintenance_date', thresholdDate.toISOString().split('T')[0]);

    if (criticalOnly) {
      query = query.eq('status', 'critical');
    }

    const { data: dueEquipment, error: equipmentError } = await query;

    if (equipmentError) {
      throw new Error(`Failed to fetch equipment: ${equipmentError.message}`);
    }

    if (!dueEquipment || dueEquipment.length === 0) {
      return new Response(JSON.stringify({
        message: "No equipment due for maintenance",
        count: 0
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Generate summary email
    const equipmentList = dueEquipment.map(eq => {
      const dueDate = new Date(eq.next_maintenance_date);
      const today = new Date();
      const isOverdue = dueDate < today;
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...eq,
        isOverdue,
        daysDiff,
        urgency: isOverdue ? 'overdue' : (daysDiff <= 2 ? 'urgent' : 'due')
      };
    }).sort((a, b) => {
      // Sort by urgency: overdue first, then by days until due
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysDiff - b.daysDiff;
    });

    const overdueCount = equipmentList.filter(eq => eq.isOverdue).length;
    const urgentCount = equipmentList.filter(eq => !eq.isOverdue && eq.daysDiff <= 2).length;
    const dueCount = equipmentList.filter(eq => !eq.isOverdue && eq.daysDiff > 2).length;

    const summaryHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">📋 Maintenance Alert Summary</h2>
          
          <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            ${overdueCount > 0 ? `
              <div style="background-color: #fff5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; flex: 1; min-width: 200px;">
                <h3 style="color: #dc3545; margin: 0; font-size: 16px;">🚨 Overdue</h3>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #dc3545;">${overdueCount}</p>
              </div>
            ` : ''}
            
            ${urgentCount > 0 ? `
              <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; flex: 1; min-width: 200px;">
                <h3 style="color: #ff9800; margin: 0; font-size: 16px;">⚠️ Urgent (≤2 days)</h3>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #ff9800;">${urgentCount}</p>
              </div>
            ` : ''}
            
            ${dueCount > 0 ? `
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6b7280; flex: 1; min-width: 200px;">
                <h3 style="color: #6b7280; margin: 0; font-size: 16px;">📅 Due Soon</h3>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #6b7280;">${dueCount}</p>
              </div>
            ` : ''}
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Equipment Details</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Equipment</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Location</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Due Date</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Status</th>
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${equipmentList.map(eq => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      <strong>${eq.name}</strong><br>
                      <small style="color: #666;">${eq.category || 'N/A'}</small>
                    </td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${eq.location || 'N/A'}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      ${eq.next_maintenance_date}
                      ${eq.isOverdue ? '<br><small style="color: #dc3545; font-weight: bold;">OVERDUE</small>' : 
                        eq.daysDiff <= 2 ? '<br><small style="color: #ff9800; font-weight: bold;">URGENT</small>' : 
                        `<br><small style="color: #666;">In ${eq.daysDiff} days</small>`}
                    </td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                        ${eq.status === 'critical' ? 'background-color: #fff5f5; color: #dc3545;' : 
                          eq.status === 'maintenance' ? 'background-color: #fff8e1; color: #ff9800;' : 
                          'background-color: #f0f9ff; color: #0369a1;'}">
                        ${eq.status?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;
                        ${eq.urgency === 'overdue' ? 'background-color: #dc3545; color: white;' :
                          eq.urgency === 'urgent' ? 'background-color: #ff9800; color: white;' :
                          'background-color: #6b7280; color: white;'}">
                        ${eq.urgency.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>This is an automated maintenance summary from Machinery Management System</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    `;

    // Send summary email to all recipients
    const emailPromises = recipients.map(async (recipient) => {
      try {
        const emailResponse = await resend.emails.send({
          from: "Machinery Management <alerts@resend.dev>",
          to: [recipient],
          subject: `📋 Maintenance Summary: ${equipmentList.length} Equipment Items Require Attention`,
          html: summaryHtml,
        });

        console.log(`Bulk email sent successfully to ${recipient}:`, emailResponse);

        // Log bulk email success
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            notification_type: 'bulk_summary',
            recipient_email: recipient,
            email_status: 'sent',
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        return { recipient, success: true, messageId: emailResponse.data?.id };
      } catch (error: any) {
        console.error(`Failed to send bulk email to ${recipient}:`, error);
        
        // Log bulk email failure
        await supabaseClient
          .from('maintenance_notifications')
          .insert({
            notification_type: 'bulk_summary',
            recipient_email: recipient,
            email_status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        return { recipient, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      message: `Bulk maintenance summary sent to ${successful} recipients, ${failed} failed`,
      equipmentCount: equipmentList.length,
      breakdown: {
        overdue: overdueCount,
        urgent: urgentCount,
        due: dueCount
      },
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-bulk-alerts function:", error);
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