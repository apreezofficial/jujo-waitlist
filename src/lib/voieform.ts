export type WaitlistSubmission = {
  id: string;
  created_at: string;
  status?: string;
  fields: {
    email?: string;
    source?: string;
    submitted_at?: string;
  };
};

type VoieformResponse = {
  success?: boolean;
  total_count?: number;
  submissions?: WaitlistSubmission[];
};

export async function getWaitlistSubmissions() {
  const secretKey = process.env.VOIEFORM_SECRET_KEY;
  const formId = process.env.VOIEFORM_FORM_ID;

  if (!secretKey || !formId) {
    throw new Error(
      'Add VOIEFORM_SECRET_KEY and VOIEFORM_FORM_ID in Vercel Environment Variables.'
    );
  }

  const response = await fetch(
    `https://api.voieform.com/v1/forms/${encodeURIComponent(
      formId
    )}/submissions?page=1&limit=100&status=verified`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Voieform request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as VoieformResponse;

  return {
    total: data.total_count ?? data.submissions?.length ?? 0,
    submissions: data.submissions ?? [],
  };
}
