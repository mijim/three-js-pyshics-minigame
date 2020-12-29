sketchFragmentShader = `
// utter random sketch noise thing improv.
// click to orbit camera
// @mmalex

vec3 roty(float th, vec3 p) { 
	float c=cos(th),s=sin(th); 
	return vec3(c*p.x-s*p.z,p.y,c*p.z+s*p.x); 
}
vec3 rotx(float th, vec3 p) { 
	float c=cos(th),s=sin(th); 
	return vec3(p.x,c*p.y-s*p.z,c*p.z+s*p.y); 
}


float hash(float n) {return fract(sin(n * 0.1346) * 43758.5453123);}//from iq
vec2 noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec4 rg = texture( iChannel0, (uv+ 0.5)/256.0, -100.0 ).yxwz;
	return mix( rg.xz, rg.yw, f.z );
}
vec4 trace(vec3 rs, vec3 re, vec2 px) 
{
	vec3 rd=re-rs;
	/*	
	vec3 rdir = vec3(1.0)/rd;
	vec3 faruv =  sign(rd);
	vec3 nearuv = -faruv;
	vec3 mint = (faruv-rs)*rdir;
	vec3 maxt = (nearuv-rs)*rdir;
	float endt=min(min(mint.x,mint.y),mint.z);			
	float startt=max(max(maxt.x,maxt.y),maxt.z);					
	*/
	float startt=0.01;
	float endt=1.;
	
	//if (endt<startt) return vec4(0.0);
	vec4 col=vec4(0.0);
	float dt=1./64. * 2.5;
	startt+=dt*hash(px.x+117.0*px.y);
	for (int i=0;i<64;++i) {
		//if (startt>=endt) continue;
		vec3 p=rs+rd*startt;
		
		vec3 p4=p*p; p4*=p4;
		float quad=pow(p4.x+p4.y+p4.z,0.25);
		vec3 tp=p;
		
		for (int j=0;j<5;++j) {
			tp.z+=iTime*0.01*float(j);
			vec2 noisev=noise(tp*5.0)*0.3; 
			tp.xz+=noisev.xy;
		}
		vec4 t=texture(iChannel1,tp.xy*0.1);
		t*=texture(iChannel1,tp.yz*0.1);
		t*=texture(iChannel1,tp.zx*0.1);
		
		float a=dot(t.xyz,vec3(0.2,0.5,0.3))*10.0;
		//a=a*(1.0-a);
		//a=smoothstep(0.6,0.7,a);
		//a-=quad*0.5;
		//float a=1.0-quad;
		//a*=1.0-quad;
		float glow=2.1/(0.01+dot(p,p));
		t.xyz+=vec3(0.22,0.2,0.18);
		t.xyz*=glow;
		
		//a*=smoothstep(1.0,0.7,quad);
		a=clamp(a,0.0,1.0);
		
		t*=a;
		col+=(1.0-col.w)*t;
		startt+=dt;
	}
	return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (fragCoord.xy-iResolution.xy*0.5) / iResolution.yy * 2.0;
	vec2 m=iMouse.xy/iResolution.xy;
	float th=(m.x-0.5)*6.0;
	vec3 rs=roty(th,vec3(0,0,-2.0));
	vec3 re=roty(th,vec3(uv*3.0,2.0));
	th=(m.y-0.5)*3.0+iTime*0.03;;
	rs=rotx(th,rs);
	re=rotx(th,re);	
	vec4 col=trace(rs,re,fragCoord);//*vec4(0.4,0.5,0.8,1.0);
	vec3 rd=normalize(re-rs)*0.5+0.5;
	col+=vec4(1.0-col.w) * 
		
		vec4(rd.y,0.5,1.0-rd.y,0.)*0.2;//*texture(iChannel2,re-rs);
	gl_fragColor = col;
}

`;

sketchVertexShader = `
varying vec2 vUv;

    void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
