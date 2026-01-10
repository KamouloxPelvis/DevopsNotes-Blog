declare module 'clamscan' {
    interface ClamScanOptions {
        removeInfected?: boolean;
        quarantineInfected?: boolean;
        scanLog?: string;
        debugMode?: boolean;
        fileList?: string;
        scanRecursively?: boolean;
        clamscan?: {
            path?: string;
            db?: string;
            active?: boolean;
        };
        clamdscan?: {
            socket?: string;
            host?: string;
            port?: number;
            timeout?: number;
            localFallback?: boolean;
            path?: string;
            active?: boolean;
        };
        preference?: string;
    }

    class ClamScan {
        constructor();
        init(options: ClamScanOptions): Promise<this>;
        scan_stream(stream: any): Promise<{ is_infected: boolean; viruses: string[] }>;
        // Ajoute d'autres méthodes si tu en as besoin (scan_file, etc.)
    }

    export default ClamScan;
}