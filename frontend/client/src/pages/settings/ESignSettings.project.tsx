import { useEffect, useMemo, useState } from "react";
import { Save, FileSignature, Upload, Plus, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import {
  ESignatureProfile,
  getESignatureProfiles,
  removeESignatureProfile,
  setDefaultESignatureProfile,
  upsertESignatureProfile,
} from "@/lib/esign-signatures";

export default function ESignSettings() {
  const { toast } = useToast();
  const [esignEnabled, setEsignEnabled] = useState(true);
  const [signatures, setSignatures] = useState<ESignatureProfile[]>(() => getESignatureProfiles());

  const [signerName, setSignerName] = useState('');
  const [designation, setDesignation] = useState('');
  const [signatureMode, setSignatureMode] = useState<'uploaded' | 'typed' | 'drawn'>('uploaded');
  const [signatureLabel, setSignatureLabel] = useState('');
  const [signatureFileName, setSignatureFileName] = useState('');
  const [signatureFileDataUrl, setSignatureFileDataUrl] = useState('');

  const defaultSignature = useMemo(
    () => signatures.find((signature) => signature.isDefault) ?? signatures[0] ?? null,
    [signatures],
  );

  useEffect(() => {
    if (signatureMode === 'typed' && signerName && !signatureLabel) {
      setSignatureLabel(signerName);
    }
  }, [signatureMode, signerName, signatureLabel]);

  const handleSignatureFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSignatureFileName('');
      setSignatureFileDataUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignatureFileDataUrl(typeof reader.result === 'string' ? reader.result : '');
      setSignatureFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const resetSignatureForm = () => {
    setSignerName('');
    setDesignation('');
    setSignatureMode('uploaded');
    setSignatureLabel('');
    setSignatureFileName('');
    setSignatureFileDataUrl('');
  };

  const refreshSignatures = () => {
    setSignatures(getESignatureProfiles());
  };

  const addSignature = () => {
    if (!signerName.trim() || !designation.trim()) {
      toast({ title: 'Missing details', description: 'Signer name and designation are required.', variant: 'destructive' });
      return;
    }

    if (signatureMode !== 'uploaded' && !signatureLabel.trim()) {
      toast({ title: 'Missing signature value', description: 'Enter a typed/drawn signature label.', variant: 'destructive' });
      return;
    }

    upsertESignatureProfile({
      signerName: signerName.trim(),
      designation: designation.trim(),
      mode: signatureMode,
      signatureLabel: (signatureMode === 'uploaded' ? (signatureFileName || signerName) : signatureLabel).trim(),
      fileName: signatureFileName || undefined,
      fileDataUrl: signatureFileDataUrl || undefined,
      isDefault: signatures.length === 0,
    });
    refreshSignatures();
    resetSignatureForm();
    toast({ title: 'Signature added', description: 'Signature profile has been saved in E-Sign settings.' });
  };

  const makeDefaultSignature = (signatureId: string) => {
    setDefaultESignatureProfile(signatureId);
    refreshSignatures();
    toast({ title: 'Default updated', description: 'Default signature suggestion updated.' });
  };

  const deleteSignature = (signatureId: string) => {
    removeESignatureProfile(signatureId);
    refreshSignatures();
    toast({ title: 'Signature removed', description: 'Signature profile removed from E-Sign settings.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">E-Sign Settings</h1>
          <p className="text-muted-foreground">Configure electronic signature settings for documents</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Digital Signature Configuration</CardTitle>
            </div>
            <CardDescription>Enable and configure electronic signatures for contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Enable E-Signatures</Label>
                <p className="text-sm text-muted-foreground">Allow digital signing of documents</p>
              </div>
              <Switch checked={esignEnabled} onCheckedChange={setEsignEnabled} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="provider">E-Signature Provider</Label>
              <Select defaultValue="docusign">
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docusign">DocuSign</SelectItem>
                  <SelectItem value="hellosign">HelloSign</SelectItem>
                  <SelectItem value="adobe">Adobe Sign</SelectItem>
                  <SelectItem value="custom">Custom Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter API Key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret</Label>
                <Input id="api-secret" type="password" placeholder="Enter API Secret" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signature Library</CardTitle>
            <CardDescription>Add multiple reusable signatures with designation for invoices, proposals, estimates, and payment records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signer-name">Signer Name</Label>
                <Input
                  id="signer-name"
                  placeholder="Enter signer name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signer-designation">Designation</Label>
                <Input
                  id="signer-designation"
                  placeholder="Enter designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="signature-mode">Signature Mode</Label>
                <Select value={signatureMode} onValueChange={(value) => setSignatureMode(value as 'uploaded' | 'typed' | 'drawn')}>
                  <SelectTrigger id="signature-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploaded">Upload Signature</SelectItem>
                    <SelectItem value="typed">Typed Signature</SelectItem>
                    <SelectItem value="drawn">Drawn Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {signatureMode === 'uploaded' ? (
                <div className="space-y-2">
                  <Label htmlFor="signature-file">Upload Signature File</Label>
                  <Input id="signature-file" type="file" accept="image/*,.pdf" onChange={handleSignatureFileChange} />
                  <p className="text-xs text-muted-foreground">Accepted formats: image, PDF</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="signature-label">Signature Text</Label>
                  <Textarea
                    id="signature-label"
                    placeholder="Enter typed or drawn signature text"
                    rows={2}
                    value={signatureLabel}
                    onChange={(e) => setSignatureLabel(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={addSignature}>
                <Plus className="mr-2 h-4 w-4" />
                Add Signature
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Saved Signatures</Label>
              {signatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No signatures added yet.</p>
              ) : (
                <div className="space-y-2">
                  {signatures.map((signature) => (
                    <div key={signature.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">{signature.signerName}</p>
                        <p className="text-xs text-muted-foreground">{signature.designation} • {signature.fileName || signature.signatureLabel}</p>
                        {signature.isDefault && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default suggestion
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!signature.isDefault && (
                          <Button variant="outline" size="sm" onClick={() => makeDefaultSignature(signature.id)}>
                            Set Default
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteSignature(signature.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {defaultSignature && (
                <p className="text-xs text-muted-foreground">
                  Current default: {defaultSignature.signerName} ({defaultSignature.designation})
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signature Appearance</CardTitle>
            <CardDescription>Customize how signatures appear on documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">No Logo</span>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Recommended size: 200x200px</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Include Company Seal</Label>
                <p className="text-sm text-muted-foreground">Add company seal to signed documents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Timestamp Signatures</Label>
                <p className="text-sm text-muted-foreground">Include date and time on signatures</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Settings</CardTitle>
            <CardDescription>Configure document handling and retention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retention">Document Retention Period</Label>
              <Select defaultValue="7years">
                <SelectTrigger id="retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="3years">3 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                  <SelectItem value="7years">7 Years</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How long to keep signed documents</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Verify signer email before allowing signature</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Send Completion Certificate</Label>
                <p className="text-sm text-muted-foreground">Email certificate after document is signed</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              toast({ title: "Settings Saved", description: "E-Sign settings have been updated successfully." });
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
